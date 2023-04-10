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
        private readonly logsService: LogsService
    ) {}

    @Process()
    async userDelete(job: Job<IJob>) {
        if (job.data.action === 'delete-user') {
            // throw new Error('User not found');
            // job.moveToFailed(new Error('User not found'));
            console.log('jfkgwekhfgwekhfjvgkhwjfgwevfjhfgvwefjhkewfvwefkjhwevwekjh')
            // await this.deleteTerritories(job.data.id);
            // await job.progress(20);

            // await this.deleteMarkers(job.data.id);
            // await job.progress(40);

            // await this.deleteAwards(job.data.id);
            // await job.progress(60);

            // await this.deleteFromWl(job.data.username);
            // await job.progress(80);

            // await this.deleteUser(job.data.id);
        } else if (job.data.action === 'suspend-user') {
            await this.deleteFromWl(job.data.username);
            await job.progress(50);

            await this.changeStatus(job.data.id, 'suspend');
        } else if (job.data.action === 'ban-user') {
            await this.deleteFromWl(job.data.username);
            await job.progress(50);

            await this.changeStatus(job.data.id, 'ban');
        } else if (job.data.action === 'resume-user' || job.data.action === 'unban-user') {
            await this.addToWl(job.data.username);
            await job.progress(50);

            await this.changeStatus(job.data.id, 'active');
        } else if (job.data.action === 'accept-user') {
            await this.addUserToServer(job.data.id);
            await job.progress(50);

            await this.changeStatus(job.data.id, 'active');
        }

        await job.progress(100);
        
        return {};
    }

    @OnQueueCompleted()
    onActive(job: Job) {
        this.logsService.logger(JSON.stringify(job.data), job.data.action , job.data.id, job.data.managerName, job.data.manager);
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

