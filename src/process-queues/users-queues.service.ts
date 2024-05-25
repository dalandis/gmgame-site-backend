import { Processor, Process, OnQueueCompleted, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { DataProviderService } from '../data-provider/data-provider.service';
import { LogsService } from '../logs/logs.service';
import { PrismaService } from '../prisma/prisma.service';

interface IJob {
  action: string;
  id: string;
  username: string;
  manager: string;
  payload?: any;
}

@Processor('users')
export class UsersConsumer {
  constructor(
    private readonly dataProviderService: DataProviderService,
    private readonly logsService: LogsService,
    @InjectQueue('markers')
    private markersQueue: Queue,
    private readonly prismaService: PrismaService,
  ) {}

  @Process()
  async userDelete(job: Job<IJob>) {
    if (job.data.action === 'delete-user') {
      await this.deleteTerritories(job.data.id);
      await job.progress(20);

      await this.deleteMarkers(job.data.id);
      await job.progress(40);

      await this.deleteAwards(job.data.id);
      await job.progress(60);

      await this.deleteFromWl(job.data.username);
      await job.progress(80);

      await this.removePlayerRole(job.data.id);

      await this.deleteUser(job.data.id);

      await this.removeFromMarkersQueue(job.data.id);
    } else if (job.data.action === 'suspend-user') {
      await this.deleteFromWl(job.data.username);
      await job.progress(30);
      await this.changeStatus(job.data.id, 'suspend');
      await job.progress(60);
      await this.suspendMarkers(job.data.id);
      await this.addManualProcess(job);
      await this.removePlayerRole(job.data.id);
    } else if (job.data.action === 'ban-user') {
      await this.deleteFromWl(job.data.username);
      await job.progress(50);
      await this.addManualProcess(job);
      await this.removePlayerRole(job.data.id);

      await this.changeStatus(job.data.id, 'ban');
    } else if (job.data.action === 'resume-user' || job.data.action === 'unban-user') {
      await this.updateUser(job.data.id);
      await this.delRegen(job.data.id);
      await this.resumeMarkers(job.data.id);
      await job.progress(30);
      await this.addToWl(job.data.username);
      await job.progress(60);
      await this.addPlayerRole(job.data.id);
      await this.changeStatus(job.data.id, 'active');
    } else if (job.data.action === 'accept-user') {
      await this.updateUser(job.data.id);
      await job.progress(30);
      await this.addUserToServer(job.data.id);
      await job.progress(60);
      await this.addPlayerRole(job.data.id);

      await this.changeStatus(job.data.id, 'active');
    } else if (job.data.action === 'create-new-user-ticket') {
      await this.sendTicket(job.data.payload);
    }

    await job.progress(100);

    return {};
  }

  @OnQueueCompleted()
  async onActive(job: Job, result: any) {
    if (job.data.noLog) {
      return;
    }

    let log = JSON.stringify(job.data);

    await this.logsService.logger(
      log,
      job.data.action,
      job.data.id,
      job.data.managerName,
      job.data.manager,
    );
  }

  async delRegen(id: string): Promise<void> {
    const user = await this.prismaService.regens.findFirst({
      where: {
        user_id: id,
      },
    });

    if (user) {
      await this.prismaService.regens.deleteMany({
        where: {
          user_id: id,
        },
      });
    }
  }

  async sendTicket(payload: any): Promise<void> {
    const response = await this.dataProviderService
      .sendToBot(payload, 'create_ticket', 'POST')
      .catch((err) => {
        throw new Error('Error while creating ticket');
      });

    if (response.status != 200) {
      throw new Error('Error while creating ticket');
    }
  }

  async removePlayerRole(id: string): Promise<void> {
    await this.dataProviderService.sendToBot({ user: id }, 'remove_role', 'POST');
  }

  async addPlayerRole(id: string): Promise<void> {
    await this.dataProviderService.sendToBot({ user: id }, 'add_role', 'POST');
  }

  async addManualProcess(job: Job<IJob>): Promise<void> {
    await this.prismaService.regens.create({
      data: {
        user_id: job.data.id,
        status: 'new',
        username: job.data.username,
      },
    });
  }

  async suspendMarkers(id: string): Promise<void> {
    await this.prismaService.markers.updateMany({
      where: {
        user_id: id,
      },
      data: {
        flag: 0,
      },
    });

    await this.prismaService.$queryRaw`
      UPDATE territories
      SET name = CONCAT('[hold] ', name),
        status = 'hold'
      WHERE user = ${id};
    `;
  }

  async resumeMarkers(id: string): Promise<void> {
    await this.prismaService.markers.updateMany({
      where: {
        user_id: id,
      },
      data: {
        flag: 1,
      },
    });

    await this.prismaService.$queryRaw`
      UPDATE gmgame.territories
      SET name = REPLACE(REPLACE(name, '[hold]', ''), '[repopulate]', ''),
        status = 'active'
      WHERE user = ${id};
    `;
  }

  async updateUser(id: string): Promise<void> {
    const response = await this.dataProviderService.sendToBot(
      { user: id },
      'check_user_define',
      'POST',
    );

    const isDiscord = response.data?.data;

    const days = isDiscord ? 60 : 14;
    const date = new Date();
    date.setDate(date.getDate() + days);

    await this.prismaService.users.update({
      where: {
        user_id: id,
      },
      data: {
        expiration_date: date,
        is_discord: isDiscord,
      },
    });
  }

  async addUserToServer(id: string): Promise<void> {
    const user = await this.prismaService.users.findUnique({
      where: {
        user_id: id,
      },
    });

    const payload = {
      username: user.username,
      password: user.password,
      type: user.type,
    };

    const response = await this.dataProviderService.sendToServerApi(
      payload,
      'add_user_new',
      'POST',
    );

    if (response.status != 200) {
      throw new Error('Error while adding user to server');
    }
  }

  async deleteUser(id: string): Promise<void> {
    await this.prismaService.users.update({
      where: {
        user_id: id,
      },
      data: {
        status: 6,
        username: null,
      },
    });
  }

  async removeFromMarkersQueue(id: string): Promise<void> {
    const job = await this.markersQueue.getJob(`${id}-create-new-user-ticket`);
    if (job) {
      await job.remove();
    }
  }

  async changeStatus(id: string, status: string): Promise<void> {
    let statusId = 0;

    if (status === 'suspend') {
      statusId = 5;
    } else if (status === 'ban') {
      statusId = 4;
    } else if (status === 'active') {
      statusId = 2;
    }

    await this.prismaService.users.update({
      where: {
        user_id: id,
      },
      data: {
        status: statusId,
      },
    });
  }

  async addToWl(username: string): Promise<void> {
    const payload = {
      user: username,
    };

    const result = await this.dataProviderService.sendToServerApi(payload, 'add_wl_new', 'POST');

    if (result.status != 200) {
      throw new Error('Error while adding user to WL');
    }
  }

  async deleteFromWl(username: string): Promise<void> {
    const payload = {
      user: username,
    };

    const result = await this.dataProviderService.sendToServerApi(payload, 'del_wl_new', 'POST');

    if (result.status != 200) {
      throw new Error('Error while deleting user from WL');
    }
  }

  async deleteAwards(id: string): Promise<void> {
    await this.prismaService.awards.deleteMany({
      where: {
        user_id: id,
      },
    });
  }

  async deleteTerritories(id: string): Promise<void> {
    await this.prismaService.territories.deleteMany({
      where: {
        user_id: id,
      },
    });
  }

  async deleteMarkers(id: string): Promise<void> {
    const markers = await this.prismaService.markers.findMany({
      where: {
        user_id: id,
      },
      distinct: ['id_type'],
    });

    this.prismaService.markers.deleteMany({
      where: {
        user_id: id,
      },
    });

    markers.forEach(async (marker) => {
      const job = await this.markersQueue.getJob(
        `refreshMarkers-${marker.server}-${marker.id_type}`,
      );

      if (job && job.data.action !== `refreshMarkers-${marker.server}-${marker.id_type}`) {
        this.markersQueue.add(
          {
            action: `refreshMarkers-${marker.server}-${marker.id_type}`,
            serverName: marker.server,
            type: marker.id_type,
          },
          {
            jobId: `refreshMarkers-${marker.server}-${marker.id_type}`,
            removeOnComplete: true,
            delay: 1000 * 60 * 15,
          },
        );
      }
    });
  }
}
