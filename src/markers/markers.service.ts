import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { markersDto } from 'src/validator/save_edit.markers';
import { Markers } from './markers.model';

@Injectable()
export class MarkersService {
    constructor(
        @InjectModel(Markers)
        private markersModel: typeof Markers,
    ) {}

    async getMarkers(user: string): Promise<Markers[]> {
        return this.markersModel.findAll({
            where: {
                user,
            }
        });
    }

    async getMarker(user: string, id: string): Promise<Markers> {
        return this.markersModel.findOne({
            where: {
                user,
                id
            }
        });
    }

    async getWorldName(world: string): Promise<string> {
        switch(world) {
            case 'gmgame':
                return 'GMGameWorld - overworld';
            case 'farm':
                return 'FarmWorld - overworld';
            default:
                return 'GMGameWorld - overworld';
        }
    }

    async editMarker(params: markersDto, user: string): Promise<Record<string,string>> {
        try {
            await this.markersModel.update(
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

            return {message: 'marker is update'};
        } catch (err) {
            return {error: `update error: ${err}`};
        } 
    }

    async addMarker(params: markersDto, user: string): Promise<Record<string,string>> {
        try {
            await this.markersModel.create({
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

            return {message: 'marker is add'};
        } catch (err) {
            return {error: `add error: ${err}`};
        } 
    }

    async deleteMarker(params: markersDto, user: string): Promise<Record<string,string>> {
        try {
            await this.markersModel.destroy({
                where: {
                    id: params.markerID,
                    user: user
                }
            });

            return {message: 'delete is add'};
        } catch (err) {
            return {error: `delete error: ${err}`};
        } 
    }
}
