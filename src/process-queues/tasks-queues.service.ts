import { Processor, Process, OnQueueCompleted } from '@nestjs/bull';
import { Job } from 'bull';
import { DataProviderService } from '../data-provider/data-provider.service';
import { LogsService } from '../logs/logs.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { PrismaService } from '../prisma/prisma.service';

interface IJobCron {
  action: string;
  id: string;
  username: string;
  manager: string;
  managerName: string;
  expirationDate: Date;
  isDiscord: boolean;
}

@Processor('cron-tasks')
export class CronTasksConsumer {
  constructor(
    private readonly dataProviderService: DataProviderService,
    private readonly logsService: LogsService,
    @InjectQueue('users')
    private usersQueue: Queue,
    private readonly prismaService: PrismaService,
  ) {}

  @Process()
  async handleCron(job: Job<IJobCron>) {
    await this.tryProlongationOrSuspend(job);
    await job.progress(50);

    await job.progress(100);

    return {};
  }

  private async tryProlongationOrSuspend(job: Job<IJobCron>) {
    if (job.data.action === 'suspend-time') {
      const payload = {
        user: job.data.username,
      };

      const result = await this.dataProviderService.sendToServerApi(
        payload,
        'get_date_last_login',
        'POST',
      );

      if (result.status != 200) {
        throw new Error('Error while getting last login date');
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      const lastLoginDate = new Date(result.data.lastlogin || Date.now());

      const expirationDate = job.data.expirationDate
        ? new Date(job.data.expirationDate)
        : new Date();

      const diffDays = this.getDiffDays(lastLoginDate, expirationDate);

      const discordResponse = await this.dataProviderService.sendToBot(
        { user: job.data.id },
        'check_user_define',
        'POST',
      );

      if (diffDays < 60) {
        const newExpirationDate = new Date(lastLoginDate);
        newExpirationDate.setDate(newExpirationDate.getDate() + 60);

        await this.prismaService.users.update({
          where: {
            user_id: job.data.id,
          },
          data: {
            expiration_date: newExpirationDate,
            is_discord: discordResponse.data.data,
          },
        });

        this.logsService.logger(
          `Prolongation ${job.data.username} to ${newExpirationDate}. Last login ${lastLoginDate}`,
          job.data.action,
          job.data.id,
          job.data.managerName,
          job.data.manager,
        );
      } else {
        this.usersQueue.add(
          {
            action: 'suspend-user',
            id: job.data.id,
            username: job.data.username,
            manager: job.data.manager,
            managerName: job.data.managerName,
            reason: 'Not active',
          },
          {
            jobId: `${job.data.id}-suspend`,
            removeOnComplete: true,
          },
        );
      }
    }
    if (job.data.action === 'suspend-discord') {
      const discordResponse = await this.dataProviderService.sendToBot(
        { user: job.data.id },
        'check_user_define',
        'POST',
      );

      if (discordResponse.data.data === false) {
        this.usersQueue.add(
          {
            action: 'suspend-user',
            id: job.data.id,
            username: job.data.username,
            manager: job.data.manager,
            managerName: job.data.managerName,
            reason: 'Not in discord',
          },
          {
            jobId: `${job.data.id}-suspend`,
            removeOnComplete: true,
          },
        );
      }
    }
  }

  private getDiffDays(dateStart: Date, dateStop: Date): number {
    const date1 = new Date(dateStart);
    const date2 = new Date(dateStop);

    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }
}
