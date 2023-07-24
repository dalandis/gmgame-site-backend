import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { markersDto } from 'src/validator/save_edit.markers';
import { Markers } from './markers.model';
import { UtilsService, IWorldType } from '../Utils/utils.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { LogsService } from '../logs/logs.service';

interface IMarkerResponse {
    marker: Markers;
    world: IWorldType;
}

@Injectable()
export class MarkersService {
    constructor(
        @InjectModel(Markers)
        private markersModel: typeof Markers,
        private readonly utilsService: UtilsService,
        @InjectQueue('markers') 
        private markersQueue: Queue,
        private readonly logsService: LogsService,
    ) {}

    async getMarkers(user: string): Promise<Markers[]> {
        return this.markersModel.findAll({
            where: {
                user,
            }
        });
    }

    async getMarker(user: string, id: string): Promise<IMarkerResponse> {
        const marker = await this.markersModel.findOne({
            where: {
                user,
                id
            }
        });

        return {
            marker: marker,
            world: this.utilsService.getWorldType(marker.id_type || '')
        };
    }

    async editMarker(params: markersDto, user: string, manager): Promise<Record<string,string>> {
        try {
            const marker = await this.markersModel.findOne({
                where: {
                    id: params.markerID
                }
            }).then((marker) => {
                this.markersModel.update(
                    {
                        server: params.server,
                        id_type: params.id_type,
                        name: params.name,
                        x: params.x,
                        y: 64,
                        z: params.z,
                        description: params.description
                    },
                    {
                        where: {
                            id: params.markerID,
                            user: user
                        }
                    }
                );
                return marker;
            })

            this.sendTask(marker.server, marker.id_type);

            this.logsService.logger(
                `маркер изменен ${marker} => ${params}`,
                'update-marker',
                user,
                manager.localuser?.username || manager.username,
                manager.id
            );

            return {message: 'marker is update'};
        } catch (err) {
            return {error: `update error: ${err}`};
        }
    }

    async addMarker(params: markersDto, user: string, manager): Promise<Record<string,string>> {
        try {
            const marker = await this.markersModel.create({
                server: params.server,
                id_type: params.id_type,
                name: params.name,
                x: params.x,
                y: 64,
                z: params.z,
                description: params.description,
                user: user,
                flag: 1
            });

            this.sendTask(marker.server, marker.id_type);

            this.logsService.logger(
                `Добавлен маркер ${marker}`,
                'add-marker',
                user,
                manager.localuser?.username || manager.username,
                manager.id
            );

            return {message: 'marker is add'};
        } catch (err) {
            return {error: `add error: ${err}`};
        } 
    }

    async deleteMarker(params: markersDto, user: string, manager): Promise<Record<string,string>> {
        try {
            const marker = await this.markersModel.findOne({
                where: {
                    id: params.markerID,
                    user: user
                }
            }).then((marker) => {
                this.markersModel.destroy({
                    where: {
                        id: params.markerID,
                        user: user
                    }
                });
                return marker;
            });

            this.sendTask(marker.server, marker.id_type);

            this.logsService.logger(
                `Удален маркер ${marker}`,
                'delete-marker',
                user,
                manager.localuser?.username || manager.username,
                manager.id
            );

            return {message: 'delete'};
        } catch (err) {
            return {error: `delete error: ${err}`};
        } 
    }

    private async sendTask(serverName, type): Promise<void> {
        const job = await this.markersQueue.getJob(`refreshMarkers-${serverName}-${type}`);

        if (job && job.data.action === `refreshMarkers-${serverName}-${type}`) {
            return;
        }

        this.markersQueue.add(
            {
                action: `refreshMarkers-${serverName}-${type}`,
                serverName: serverName,
                type: type
            },
            {
                jobId: `refreshMarkers-${serverName}-${type}`,
                removeOnComplete: true,
                delay: 1000 * 60 * 15,
            }
        );
    }
}
