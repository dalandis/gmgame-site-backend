import { Processor, Process, OnQueueCompleted } from '@nestjs/bull';
import { Job } from 'bull';
import { Territories } from '../territories/territories.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Markers } from '../markers/markers.model';
import { Awards } from '../awards/awards.model';
import { DataProviderService } from '../data-provider/data-provider.service';
import { User } from '../users/users.model';
import { LogsService } from '../logs/logs.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

interface IJobCron{
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
        @InjectModel(Territories)
        private territoriesModel: typeof Territories,
        @InjectModel(Markers)
        private markersModel: typeof Markers,
        @InjectModel(Awards)
        private awardsModel: typeof Awards,
        @InjectModel(User)
        private userModel: typeof User,
        private readonly dataProviderService: DataProviderService,
        private readonly logsService: LogsService,
        @InjectQueue('users') 
        private usersQueue: Queue,
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

            const result = await this.dataProviderService.sendToServerApi(payload, 'get_date_last_login', 'POST');

            if (result.status != 200) {
                throw new Error('Error while getting last login date');
            }

            if (result.data.error) {
                throw new Error(result.data.error);
            }

            const lastLoginDate = new Date(result.data.lastlogin || Date.now());

            const expirationDate = job.data.expirationDate ? new Date(job.data.expirationDate) : new Date();

            const diffDays = this.getDiffDays(lastLoginDate, expirationDate);

            const discordResponse = await this.dataProviderService.sendToBot({user: job.data.id}, 'check_user_define', 'POST');

            if (diffDays < 60) {
                const newExpirationDate = new Date(lastLoginDate);
                newExpirationDate.setDate(newExpirationDate.getDate() + 60);

                this.userModel.update(
                    {
                        expiration_date: newExpirationDate,
                        is_discord: discordResponse.data.data
                    },
                    {
                        where: {
                            user_id: job.data.id
                        }
                    }
                );

                this.logsService.logger(
                    `Prolongation ${job.data.username} to ${newExpirationDate}. Last login ${lastLoginDate}`, 
                    job.data.action , job.data.id, job.data.managerName, job.data.manager
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
                        removeOnComplete: true
                    }
                );
            }
        }
        if (job.data.action === 'suspend-discord') {
            const discordResponse = await this.dataProviderService.sendToBot({user: job.data.id}, 'check_user_define', 'POST');

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
                        removeOnComplete: true
                    }
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