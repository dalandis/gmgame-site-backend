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
    ) {}
    @Cron('00 01 00 * * *', {
        disabled: false,
        timeZone: 'Europe/Moscow'
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
                    {[Op.or]: [
                        {expiration_date: null},
                        {expiration_date: {[Op.lt]: date}}
                    ]},
                    {[Op.or]: [
                        {immun: false},
                        {immun: null}
                    ]},
                    {status: 2},
                    {is_discord: 1}
                ]
            }
        });

        for (const user of usersInDiscord) {
            console.log(user.username, ' - ', user.expiration_date)
            await this.cronTasksQueue.add(
                {
                    action: 'suspend-time',
                    id: user.user_id,
                    username: user.username,
                    manager: 'cron-task',
                    managerName: 'cron-task',
                    expirationDate: user.expiration_date,
                    isDiscord: user.is_discord
                },
                {
                    jobId: `${user.user_id}-suspend-time`,
                    removeOnComplete: true
                }
            );
        }

        const usersOutDiscord = await this.userModel.findAll({
            where: {
                [Op.and]: [
                    {[Op.or]: [
                        {expiration_date: null},
                        {expiration_date: {[Op.lt]: date}}
                    ]},
                    {[Op.or]: [
                        {immun: false},
                        {immun: null}
                    ]},
                    {status: 2},
                    {[Op.or]: [
                        {is_discord: 0},
                        {is_discord: null}
                    ]}
                ]
            }
        });

        for (const user of usersOutDiscord) {
            console.log(user.username, ' - ', user.expiration_date, ' discord')
            this.cronTasksQueue.add(
                {
                    action: 'suspend-discord',
                    id: user.user_id,
                    username: user.username,
                    manager: 'cron-task',
                    managerName: 'cron-task',
                    expirationDate: user.expiration_date,
                    isDiscord: user.is_discord
                },
                {
                    jobId: `${user.user_id}-suspend-discord`,
                    removeOnComplete: true
                }
            );
        }
    }
}
