import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CronTasksService {
  constructor(
    @InjectQueue('cron-tasks')
    private cronTasksQueue: Queue,
    @InjectQueue('citizenship')
    private citizenshipQueue: Queue,
    private prismaService: PrismaService,
  ) {}

  @Cron('00 01 00 * * *', {
    disabled: false,
    timeZone: 'Europe/Moscow',
  })
  async handleCron() {
    if (process.env.pm_id !== '0') {
      return;
    }
    if (process.env.NODE_ENV === 'dev') {
      return;
    }

    const date = new Date();

    const usersInDiscord = await this.prismaService.users.findMany({
      where: {
        expiration_date: { lt: date },
        immun: false,
        status: 2,
        is_discord: true,
      },
    });

    for (const user of usersInDiscord) {
      console.log(user.username, ' - ', user.expiration_date);
      await this.cronTasksQueue.add(
        {
          action: 'suspend-time',
          id: user.user_id,
          username: user.username,
          manager: 'cron-task',
          managerName: 'cron-task',
          expirationDate: user.expiration_date,
          isDiscord: user.is_discord,
        },
        {
          jobId: `${user.user_id}-suspend-time`,
          removeOnComplete: true,
        },
      );
    }

    const usersOutDiscord = await this.prismaService.users.findMany({
      where: {
        expiration_date: { lt: date },
        immun: false,
        status: 2,
        is_discord: false,
      },
    });

    for (const user of usersOutDiscord) {
      console.log(user.username, ' - ', user.expiration_date, ' discord');
      this.cronTasksQueue.add(
        {
          action: 'suspend-discord',
          id: user.user_id,
          username: user.username,
          manager: 'cron-task',
          managerName: 'cron-task',
          expirationDate: user.expiration_date,
          isDiscord: user.is_discord,
        },
        {
          jobId: `${user.user_id}-suspend-discord`,
          removeOnComplete: true,
        },
      );
    }
  }

  @Cron('00 03 00 * * *', {
    disabled: false,
    timeZone: 'Europe/Moscow',
  })
  async cronSitizenship() {
    if (process.env.pm_id !== '0') {
      return;
    }
    if (process.env.NODE_ENV === 'dev') {
      return;
    }

    const citizenships = await this.prismaService.users.findMany({
      where: {
        citizenship: true,
        is_discord: true,
      },
      select: {
        username: true,
        user_id: true,
      },
    });

    await this.citizenshipQueue.add(
      {
        action: 'citizenship',
        citizenships,
      },
      {
        jobId: `citizenship`,
        removeOnComplete: true,
      },
    );
  }

  @Cron('0 0 * * 0', {
    disabled: true,
    timeZone: 'Europe/Moscow',
  })
  async clearYearsOldUsersRequests() {
    if (process.env.pm_id !== '0') {
      return;
    }
    if (process.env.NODE_ENV === 'dev') {
      return;
    }

    const date = new Date();
    const dateOneYearOld = new Date(date.getFullYear() - 1);

    const oldDeniedUsers = await this.prismaService.users.findMany({
      where: {
        updatedAt: {
          lt: dateOneYearOld,
        },
        status: 3,
      },
    });

    for (const user of oldDeniedUsers) {
      await this.prismaService.users.update({
        where: {
          id: user.id,
        },
        data: {
          status: 7,
          tag: '{}',
          age: 0,
          from_about: '',
          you_about: '',
          type: 0,
          username: null,
          reapplication: false,
        },
      });
    }
  }
}
