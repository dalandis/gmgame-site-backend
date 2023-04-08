import { Controller, Get, UseGuards, Request, Response, Param, Post, Body, HttpStatus, SetMetadata } from '@nestjs/common';
import { MarkersService } from './markers.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { markersDto } from '../validator/save_edit.markers';
import { UtilsService } from '../Utils/utils.service';
import { RoleGuard } from '../auth/roles/api-roles';

@Controller('/api')
export class MarkersController {
    constructor(
        private readonly markersService: MarkersService,
        private readonly utilsService: UtilsService
    ) {}
    
    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Get('/get_markers')
    async getMarkers(@Request() req, @Response() res): Promise<any> {
        const markers = await this.markersService.getMarkers(req.user.id);

        res.send({
            count: markers.length,
            markers: markers
        });
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Get('/get_marker/:id_marker')
    async getMarker(@Request() req, @Response() res, @Param() params): Promise<any> {
        if (params.id_marker === 'new') {
            return res.send({});
        }

        const marker = await this.markersService.getMarker(req.user.id, params.id_marker);

        res.send({
            marker: marker,
            world_name: await this.utilsService.getWorldName(marker.server || '')
        });
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Post('/edit_marker')
    async editMarker(@Request() req, @Body() body: markersDto, @Response() res): Promise<any> {
        const message = await this.markersService.editMarker(body, req.user.id);
        console.log(message);
        res.send(JSON.stringify(message));
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Post('add_marker')
    async addMarker(@Request() req, @Body() body: markersDto, @Response() res): Promise<any> {
        const message = await this.markersService.addMarker(body, req.user.id);
        console.log(message);
        res.send(JSON.stringify(message));
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Post('delete_marker')
    async deleteMarker(@Request() req, @Body() body: markersDto, @Response() res): Promise<any> {
        const message = await this.markersService.deleteMarker(body, req.user.id);
        console.log(message);
        res.send(JSON.stringify(message));
    }
}