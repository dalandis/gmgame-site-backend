import { Injectable } from '@nestjs/common';
import {
  actionUserDto,
  getUserDto,
  markersUpdateDto,
  regenActionDto,
  terrUpdateDto,
  updateUserDto,
} from '../../validator/admin/users-admin';
import { Queue } from 'bull';
import * as Minio from 'minio';
import { RedisService } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { ConfigModule } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { users, markers, territories } from '@prisma/client';
import { LogsService } from '../../logs/logs.service';
import { PrismaService } from '../../prisma/prisma.service';

ConfigModule.forRoot({
  envFilePath: '.env.minio',
});

@Injectable()
export class UserAdminService {
  private readonly redis: Redis;

  constructor(
    @InjectQueue('users')
    private usersQueue: Queue,
    private logsService: LogsService,
    @InjectQueue('markers')
    private markersQueue: Queue,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
  ) {
    this.redis = this.redisService.getClient();
  }

  async getUser(params: getUserDto): Promise<Omit<users, 'password'>[]> {
    const users = await this.prismaService.users.findMany({
      where: {
        OR: [
          { user_id: params.searchParam },
          { username: { contains: params.searchParam, mode: 'insensitive' } },
        ],
      },
      include: {
        markers: true,
        territories: true,
        tickets: true,
        oldUsers: {
          omit: { password: true },
        },
      },
      omit: { password: true },
    });

    return users;
  }

  async getMarkers(): Promise<markers[]> {
    return this.prismaService.markers.findMany({
      include: {
        user: {
          select: {
            username: true,
            user_id: true,
          },
        },
      },
    });
  }

  async getTerritories(): Promise<territories[]> {
    return this.prismaService.territories.findMany({
      include: {
        user: {
          select: {
            username: true,
            user_id: true,
          },
        },
      },
    });
  }

  async actionUser(
    params: actionUserDto,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    const user = await this.prismaService.users.findUnique({
      where: {
        user_id: params.user,
      },
      select: {
        username: true,
        status: true,
        tag: true,
        type: true,
        user_id: true,
        age: true,
      },
    });

    if (!user) {
      return { error: true, message: 'Пользователь не найден' };
    }

    const job = await this.usersQueue.getJob(`${user.user_id}-${params.action}`);

    if (job && job.data.action === `${params.action}-user`) {
      return { error: true, message: 'Уже есть такой таск' };
    }

    switch (params.action) {
      case null:
        return { error: true, message: 'Неизвестное действие' };
      case 'decline':
        this.prismaService.users.update({
          where: {
            user_id: user.user_id,
          },
          data: {
            status: 3,
          },
        });

        return { result: true, message: 'Пользователь отклонен' };
      default:
        this.usersQueue.add(
          {
            action: `${params.action}-user`,
            id: user.user_id,
            username: user.username,
            manager: manager.id,
            managerName: manager.localuser?.username || manager.username,
          },
          {
            jobId: `${user.user_id}-${params.action}`,
            removeOnComplete: true,
          },
        );
        return { result: true, message: 'Задача добавлена в очередь' };
    }
  }

  async deleteMarker(
    id: number,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    const deleteMarker = await this.prismaService.markers.delete({
      where: {
        id: id,
      },
    });

    this.logsService.logger(
      JSON.stringify({ action: 'delete-marker', data: deleteMarker }),
      'delete-marker',
      deleteMarker.user_id,
      manager.localuser.username,
      manager.id,
    );

    const job = await this.markersQueue.getJob(
      `refreshMarkers-${deleteMarker.server}-${deleteMarker.id_type}`,
    );

    if (
      job &&
      job.data.action !== `refreshMarkers-${deleteMarker.server}-${deleteMarker.id_type}`
    ) {
      this.markersQueue.add(
        {
          action: `refreshMarkers-${deleteMarker.server}`,
          serverName: deleteMarker.server,
          type: deleteMarker.id_type,
        },
        {
          jobId: `refreshMarkers-${deleteMarker.server}-${deleteMarker.id_type}`,
          removeOnComplete: true,
          delay: 1000 * 60 * 15,
        },
      );
    }

    return { result: true, message: 'Маркер удален' };
  }

  async getLogs(id): Promise<any> {
    return this.logsService.getLogs(id);
  }

  async updateMarker(
    body: markersUpdateDto,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    const marker = await this.prismaService.markers.findUnique({
      where: {
        id: body.id,
      },
      include: {
        user: {
          select: {
            username: true,
            user_id: true,
          },
        },
      },
    });

    if (!marker) {
      return { error: true, message: 'Маркер не найден' };
    }

    await this.prismaService.markers.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
        x: body.x,
        y: 64,
        z: body.z,
        id_type: body.id_type,
        description: body.description,
      },
    });

    this.logsService.logger(
      JSON.stringify({
        action: 'update-marker',
        data: { oldMarker: marker, newMarker: body },
      }),
      'update-marker',
      marker.user_id,
      manager.localuser.username,
      manager.id,
    );

    const job = await this.markersQueue.getJob(`refreshMarkers-${marker.server}-${marker.id_type}`);

    if (!job && job?.data?.action !== `refreshMarkers-${marker.server}-${marker.id_type}`) {
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

    return { result: true, message: 'Маркер обновлен' };
  }

  async deleteTerritory(
    id: number,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    const territory = await this.prismaService.territories.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            username: true,
            user_id: true,
          },
        },
      },
    });

    if (!territory) {
      return { error: true, message: 'Территория не найдена' };
    }

    await this.prismaService.territories.delete({
      where: {
        id: id,
      },
    });

    this.logsService.logger(
      JSON.stringify({ action: 'delete-territory', data: territory }),
      'delete-territory',
      territory.user_id,
      manager.localuser.username,
      manager.id,
    );

    return { result: true, message: 'Территория удалена' };
  }

  async updateTerritory(
    body: terrUpdateDto,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    const territory = await this.prismaService.territories.findUnique({
      where: {
        id: body.id,
      },
      include: {
        user: {
          select: {
            username: true,
            user_id: true,
          },
        },
      },
    });

    if (!territory) {
      return { error: true, message: 'Территория не найдена' };
    }

    await this.prismaService.territories.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
        world: body.world,
        xStart: body.xStart,
        xStop: body.xStop,
        zStart: body.zStart,
        zStop: body.zStop,
      },
    });

    this.logsService.logger(
      JSON.stringify({
        action: 'update-territory',
        data: { oldTerritory: territory, newTerritory: body },
      }),
      'update-territory',
      territory.user_id,
      manager.localuser.username,
      manager.id,
    );

    return { result: true, message: 'Территория обновлена' };
  }

  async getRegens(): Promise<any> {
    return this.prismaService.regens.findMany({
      where: {
        status: 'new',
      },
    });
  }

  async updateUser(
    body: updateUserDto,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    const user = await this.prismaService.users.findUnique({
      where: {
        user_id: body.id,
      },
      select: {
        expiration_date: true,
      },
    });

    if (!user) {
      return { error: true, message: 'Пользователь не найден' };
    }

    await this.prismaService.users.update({
      where: {
        user_id: body.id,
      },
      data: {
        immun: body.immun,
        expiration_date: body.expiration_date,
        note: body.note,
        partner: body.partner,
        citizenship: body.citizenship,
      },
    });

    if (body.expiration_date) {
      this.logsService.logger(
        JSON.stringify({
          action: 'change-expiration-date',
          data: {
            expirationDate: user.expiration_date,
            newExpirationDate: body.expiration_date,
          },
        }),
        'update-user',
        body.id,
        manager.localuser.username,
        manager.id,
      );
    }

    return { result: true, message: 'Пользователь обновлен' };
  }

  //regenAction
  async regenAction(
    body: regenActionDto,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    await this.prismaService.markers.deleteMany({
      where: {
        user_id: body.user_id,
      },
    });

    if (body.action === 'regen') {
      await this.prismaService.territories.deleteMany({
        where: {
          user_id: body.user_id,
        },
      });
    } else {
      await this.prismaService.$queryRaw`
        UPDATE 
          territories 
        SET 
          name = REPLACE(name, '[hold]', '[repopulate]'), 
          status = 'repopulate' 
        WHERE 
          user_id = '${body.user_id}'
      `;
    }

    await this.prismaService.regens.deleteMany({
      where: {
        user_id: body.user_id,
      },
    });

    this.logsService.logger(
      JSON.stringify({
        action: 'regen-complet',
        data: { action: body.action },
      }),
      'regen-user',
      body.user_id,
      manager.discordUser?.username || manager.username,
      manager.id,
    );

    return { result: true, message: 'Реген завершен' };
  }

  async getWhitelist(): Promise<any> {
    return this.prismaService.users.findMany({
      where: {
        status: 2,
      },
      select: {
        username: true,
        status: true,
        tag: true,
        type: true,
        user_id: true,
        age: true,
        from_about: true,
        you_about: true,
        partner: true,
        immun: true,
        note: true,
        expiration_date: true,
      },
    });
  }

  async getLink(name: string): Promise<any> {
    let link = await this.redis.get(`gmgame:link:${name}`);

    if (link) {
      return link;
    }

    console.log('getLink');

    const minioClient = new Minio.Client({
      endPoint: process.env.MINIO_END_POINT,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: true,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });

    const expiresLink = 60 * 60 * 24 * 7;

    link = await minioClient.presignedGetObject('tikets', name, expiresLink);

    this.redis.set(`gmgame:link:${name}`, link, 'EX', expiresLink);

    return link;
  }
}
