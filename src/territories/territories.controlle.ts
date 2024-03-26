import { Controller, Get, UseGuards, Request, Response, Param, Post, Body, HttpStatus, SetMetadata } from '@nestjs/common';
import { TerritoriesService } from './territories.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { territoriesDto } from '../validator/save_edit.territories';
import { UtilsService } from '../Utils/utils.service';
import { RoleGuard } from '../auth/roles/api-roles';

@Controller('/api')
export class TerritoriesController {
    constructor(
        private readonly territoriesService: TerritoriesService,
        private readonly utilsService: UtilsService
    ) {}

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Get('/get_territories')
    async getTerritories(@Request() req, @Response() res): Promise<any> {
        const territories = await this.territoriesService.getTerritories(req.user.id);

        res.send({
            count: territories.length,
            markers: territories
        });
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Get('/get_terr/:id_terr')
    async getTerr(@Request() req, @Response() res, @Param() params): Promise<any> {
        const terr = await this.territoriesService.getTerr(req.user.id, params.id_terr);

        if (!terr) {
            res.status(HttpStatus.NO_CONTENT).json({
                message: 'Территория не найдена'
            });
            return;
        }
        res.send({
            terr: terr,
            world: this.utilsService.getWorldName(terr.world || '')
        });
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Post('/edit_terr')
    async editTerr(@Request() req, @Body() body: territoriesDto, @Response() res): Promise<any> {
        const message = await this.territoriesService.editTerritories(body, req.user.id);
        console.log(message);
        res.send(JSON.stringify(message));
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Post('add_terr')
    async addTerr(@Request() req, @Body() body: territoriesDto, @Response() res): Promise<any> {
        const message = await this.territoriesService.addTerritories(body, req.user.id);
        console.log(message);
        res.send(JSON.stringify(message));
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Post('delete_terr')
    async deleteTerr(@Request() req, @Body() body: territoriesDto, @Response() res): Promise<any> {
        const message = await this.territoriesService.deleteTerritories(body, req.user.id);
        console.log(message);
        res.send(JSON.stringify(message));
    }
}