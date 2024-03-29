import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { territoriesDto } from 'src/validator/save_edit.territories';
import { Territories } from './territories.model';
import { UtilsService } from '../Utils/utils.service';

@Injectable()
export class TerritoriesService {
    constructor(
        @InjectModel(Territories)
        private territoriesModel: typeof Territories,
        private readonly utilsService: UtilsService
    ) {}

    async getTerritories(user: string): Promise<Territories[]> {
        return this.territoriesModel.findAll({
            where: {
                user,
            }
        });
    }

    async getTerr(user: string, id: string): Promise<Territories> {
        return this.territoriesModel.findOne({
            where: {
                user,
                id
            }
        });
    }

    async editTerritories(params: territoriesDto, user: string): Promise<Record<string,string>> {
        try {
            await this.territoriesModel.update(
                {
                    world: params.server,
                    name: params.name,
                    xStart: params.startX,
                    xStop: params.stopX,
                    zStart: params.startZ,
                    zStop: params.stopZ
                },
                {
                    where: {
                        id: params.terrID,
                        user: user
                    }
                }
            );
            const responce = this.utilsService.getWorldName(params.server);
            return {message: 'terr is update', ...responce};
        } catch (err) {
            return {error: `update error: ${err}`};
        } 
    }

    async addTerritories(params: territoriesDto, user: string): Promise<Record<string,string>> {
        try {
            await this.territoriesModel.create({
                world: params.server,
                name: params.name,
                xStart: params.startX,
                xStop: params.stopX,
                zStart: params.startZ,
                zStop: params.stopZ,
                user: user,
                status: 'active'
            });
            const responce = this.utilsService.getWorldName(params.server);
            return {message: 'terr is add', ...responce};
        } catch (err) {
            return {error: `add error: ${err}`};
        } 
    }

    async deleteTerritories(params: territoriesDto, user: string): Promise<Record<string,string>> {
        try {
            await this.territoriesModel.destroy({
                where: {
                    id: params.terrID,
                    user: user
                }
            });

            return {message: 'delete is add'};
        } catch (err) {
            return {error: `delete error: ${err}`};
        } 
    }
}
