import { Processor, Process, OnQueueCompleted } from '@nestjs/bull';
import { Job } from 'bull';
import { Territories } from '../territories/territories.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op, literal } from 'sequelize';
import { Markers } from '../markers/markers.model';
import { Awards } from '../awards/awards.model';
import { DataProviderService } from '../data-provider/data-provider.service';
import { User } from '../users/users.model';
import { LogsService } from '../logs/logs.service';
import { Regens } from '../admin/users/regens.model';

interface IJob{
    action: string;
    id: string;
    username: string;
    manager: string;
}

@Processor('users')
export class UsersConsumer {
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
        @InjectModel(Regens)
        private regensModel: typeof Regens,
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

            await this.deleteUser(job.data.id);
        } else if (job.data.action === 'suspend-user') {
            await this.deleteFromWl(job.data.username);
            await job.progress(30);
            await this.changeStatus(job.data.id, 'suspend');
            await job.progress(60);
            await this.suspendMarkers(job.data.id);
            await this.addManualProcess(job);
        } else if (job.data.action === 'ban-user') {
            await this.deleteFromWl(job.data.username);
            await job.progress(50);
            await this.addManualProcess(job);

            await this.changeStatus(job.data.id, 'ban');
        } else if (job.data.action === 'resume-user' || job.data.action === 'unban-user') {
            await this.updateUser(job.data.id);
            await this.delRegen(job.data.id);
            await this.resumeMarkers(job.data.id);
            await job.progress(30);
            await this.addToWl(job.data.username);
            await job.progress(60);

            await this.changeStatus(job.data.id, 'active');
        } else if (job.data.action === 'accept-user') {
            await this.updateUser(job.data.id);
            await job.progress(30);
            await this.addUserToServer(job.data.id);
            await job.progress(60);

            await this.changeStatus(job.data.id, 'active');
        }

        await job.progress(100);
        
        return {};
    }

    @OnQueueCompleted()
    async onActive(job: Job, result: any) {
        let log = JSON.stringify(job.data);

        await this.logsService.logger(log, job.data.action , job.data.id, job.data.managerName, job.data.manager);
    }

    async delRegen(id: string): Promise<void> {
        const user = await this.regensModel.findOne({
            where: {
                user_id: id,
            },
        });

        if (user) {
            await this.regensModel.destroy({
                where: {
                    user_id: id,
                },
            });
        }
    }

    async addManualProcess(job: Job<IJob>): Promise<void> {
        await this.regensModel.create({
            user_id: job.data.id,
            status: 'new',
            username: job.data.username
        }).catch((err) => {
            console.log(err);
        });
    }

    async suspendMarkers(id: string): Promise<void> {
        await this.markersModel.update(
            {
                flag: 0,
            },
            {
                where: {
                    user: id,
                }, 
            }
        );

        await this.territoriesModel.update(
            {
                name: literal('CONCAT("[hold] ", name)'),
            },
            {
                where: {
                    user: id,
                },
            }
        );
    }

    async resumeMarkers(id: string): Promise<void> {
        await this.markersModel.update(
            {
                flag: 1,
            },
            {
                where: {
                    user: id,
                },
            }
        );

        await this.territoriesModel.update(
            {
                name: literal('REPLACE(REPLACE(name, "[hold]", ""), [repopulate], "")'),
            },
            {
                where: {
                    user: id,
                },
            }
        );
    }

    async updateUser(id: string): Promise<void> {
        const response = await this.dataProviderService.sendToBot({user: id}, 'check_user_define', 'POST');

        const isDiscord = response.data?.data;

        const days = isDiscord ? 60 : 14;
        const date = new Date();
        date.setDate(date.getDate() + days);

        await this.userModel.update(
            {
                expiration_date: date,
                is_discord: isDiscord.data
            },
            {
                where: {
                    user_id: id
                }
            }
        ).catch((err) => {
            console.log(err);
        });
    }

    async addUserToServer(id: string): Promise<void> {
        const user = await this.userModel.findOne({
            where: {
                user_id: id,
            },
        });

        const payload = {
            "username" : user.username,
            "password" : user.password,
            "type" : user.type
        }

        const response = await this.dataProviderService.sendToServerApi(payload, 'add_user_new', 'POST');

        if (response.status != 200) {
            throw new Error('Error while adding user to server');
        }
    }

    async deleteUser(id: string): Promise<void> {
        await this.userModel.destroy({
            where: {
                user_id: id,
            },
        });
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

        await this.userModel.update(
            {
                status: statusId,
            },
            {
                where: {

                    user_id: id,
                },
            },
        );
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
            user: username
        };

        const result = await this.dataProviderService.sendToServerApi(payload, 'del_wl_new', 'POST');
            
        if (result.status != 200) {
            throw new Error('Error while deleting user from WL');
        }
    }

    async deleteAwards(id: string): Promise<void> {
        await this.awardsModel.destroy({
            where: {
                user: id
            }
        });
    }

    async deleteTerritories(id: string): Promise<void> {
        await this.territoriesModel.destroy({
            where: {
                user: id
            }
        });
    }

    async deleteMarkers(id: string): Promise<void> {
        await this.markersModel.destroy({
            where: {
                user: id
            }
        });
    }

}

