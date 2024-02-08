import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/users.model';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Op } from 'sequelize';

@Injectable()
export class CronTasksService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectQueue('cron-tasks')
    private cronTasksQueue: Queue,
    @InjectQueue('citizenship')
    private citizenshipQueue: Queue,
  ) {}

  @Cron('00 01 00 * * *', {
    disabled: false,
    timeZone: 'Europe/Moscow',
  })
  async handleCron() {
    if (process.env.pm_id !== '2') {
      return;
    }
    if (process.env.NODE_ENV === 'dev') {
      return;
    }

    const date = new Date();

    const usersInDiscord = await this.userModel.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { expiration_date: null },
              { expiration_date: { [Op.lt]: date } },
            ],
          },
          { [Op.or]: [{ immun: false }, { immun: null }] },
          { status: 2 },
          { is_discord: 1 },
        ],
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

    const usersOutDiscord = await this.userModel.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { expiration_date: null },
              { expiration_date: { [Op.lt]: date } },
            ],
          },
          { [Op.or]: [{ immun: false }, { immun: null }] },
          { status: 2 },
          { [Op.or]: [{ is_discord: 0 }, { is_discord: null }] },
        ],
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
    // if (process.env.pm_id !== '2') {
    //   return;
    // }

    const citizenships = await this.userModel.findAll({
      where: {
        [Op.and]: [{ citizenship: true }, { is_discord: true }],
      },
      attributes: ['username', 'user_id'],
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
    disabled: false,
    timeZone: 'Europe/Moscow',
  })
  async clearYearsOldUsersRequests() {
    if (process.env.pm_id !== '2') {
      return;
    }
    if (process.env.NODE_ENV === 'dev') {
      return;
    }
    
    const date = new Date();
    const dateOneYearOld = date.getFullYear() - 1;

    const oldDeniedUsers = await this.userModel.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { updatedAt: null },
              { updatedAt: { [Op.lt]: dateOneYearOld } },
            ],
          },
          { status: 3 },
        ],
      },
    });

    for (const user of oldDeniedUsers) {
      await this.userModel.update(            
        {
          status: 7,
          tag: '{}',
          age: 0,
          from_about: '',
          you_about: '',
          type: 0,
          username: null,
          reapplication: false,
        },
        {
          where: {
            id: user.id
          }
        }
      );  
    }
  }
}
