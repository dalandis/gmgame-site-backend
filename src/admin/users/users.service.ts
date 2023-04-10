import { Injectable } from '@nestjs/common';
import { actionUserDto, getUserDto } from '../../validator/admin/users-admin';
import { User } from '../../users/users.model';
import { Markers } from '../../markers/markers.model';
import { Territories } from '../../territories/territories.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { LogsService } from '../../logs/logs.service';

@Injectable()
export class UserAdminService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        @InjectModel(Markers)
        private markersModel: typeof Markers,
        @InjectModel(Territories)
        private territoriesModel: typeof Territories,
        @InjectQueue('users') 
        private usersQueue: Queue,
        private logsService: LogsService
    ) {}

    async getUser(params: getUserDto): Promise<User> {
        const user = await this.userModel.findOne({
            include: [
                {model: this.markersModel},
                {model: this.territoriesModel}
            ],
            where: {
                [Op.or]: [
                    {user_id: params.searchParam},
                    {username: params.searchParam}
                ]
            },
            attributes: ['username', 'status', 'tag', 'type', 'user_id', 'age', 'from_about', 'you_about', 'partner', 'immun', 'note']
        });

        return user;
    }

    async getMarkers(): Promise<Markers[]> {
        return this.markersModel.findAll();
    }

    async getTerritories(): Promise<Territories[]> {
        return this.territoriesModel.findAll();
    }

    async actionUser(params: actionUserDto, manager): Promise<{error?: boolean, result?: boolean, message?: string}> {
        const user = await this.userModel.findOne({
            where: {
                user_id: params.user
            },
            attributes: ['username', 'status', 'tag', 'type', 'user_id', 'age']
        });

        if (!user) {
            return { error: true, message: 'Пользователь не найден' };
        }

        const job = await this.usersQueue.getJob(user.user_id);

        if (job && job.data.action === `${params.action}-user`) {
            return {error: true,  message: 'Уже есть такой таск'};
        }

        switch (params.action) {
            case 'delete':
                this.usersQueue.add(
                    {
                        action: `${params.action}-user`,
                        id: user.user_id,
                        username: user.username,
                        manager: manager.id,
                        managerName: manager.localuser.username
                    },
                    {
                        jobId: user.user_id,
                        removeOnComplete: true
                    }
                );
                return { result: true, message: 'Задача добавлена в очередь' };
            case 'decline':
                this.userModel.update(
                    {
                        status: 3
                    },
                    {
                        where: {
                            user_id: user.user_id
                        }
                    }
                );
                return { result: true, message: 'Пользователь отклонен' };
            case 'default':
                return { error: true, message: 'Неизвестное действие' };
        }
    }

    async deleteMarker(id: number, manager): Promise<{error?: boolean, result?: boolean, message?: string}> {
        const marker = await this.markersModel.findOne({
            where: {
                id: id
            }
        }).then((marker) => {
            this.markersModel.destroy({
                where: {
                    id: id
                }
            });
            return marker;
        });

        this.logsService.logger(
            JSON.stringify({action: 'delete-marker', data: marker}), 
            'delete-marker',
            marker.user,
            manager.localuser.username,
            manager.id
        );
        
        return { result: true, message: 'Маркер удален' };
    }

    async getLogs(id): Promise<any> {
        return this.logsService.getLogs(id);
    }

    //update_marker
    // async updateMarker(id: number, manager): Promise<{error?: boolean, result?: boolean, message?: string}> {
        // const marker = await this.markersModel.findOne({
        //     where: {
        //         id: id
        //     }
        // }).then((marker) => {
        //     this.markersModel.update(
        //         {
        //             status: 1
        //         },
        //         {
        //             where: {
        //                 id: id
        //             }
        //         }
        //     );
        //     return marker;
        // }
    // }

    
}
