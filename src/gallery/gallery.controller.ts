import { Controller, Get, UseGuards, Request, Response, Param, Post, Body, HttpStatus, SetMetadata } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { galleryDto } from '../validator/save_edit.gallery';
import { UtilsService } from '../Utils/utils.service';
import { RoleGuard } from '../auth/roles/api-roles';

@Controller('/api')
export class GalleryController {
    constructor(
        private readonly galleryService: GalleryService,
        private readonly utilsService: UtilsService
    ) { }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Get('/get_galleries')
    async getGalleries(@Request() req, @Response() res): Promise<any> {
        const galleries = await this.galleryService.getGalleries(req.user.id);

        res.send({
            count: galleries.length,
            data: galleries
        });
    }

    @Get('/get_all_galleries')
    async getAllGalleries(@Request() req, @Response() res): Promise<any> {
        const galleries = await this.galleryService.getAllGalleries();

        res.send({
            count: galleries.length,
            data: galleries
        });
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Get('/get_gallery/:id_gall')
    async getGallery(@Request() req, @Response() res, @Param() params): Promise<any> {
        const gall = await this.galleryService.getGallery(req.user.id, params.id_gall);

        if (!gall) {
            res.status(HttpStatus.NO_CONTENT).json({
                message: 'Данный пост не найден'
            });
            return;
        }
        res.send({
            data: gall,
        });
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Post('/edit_gallery')
    async editGallery(@Request() req, @Body() body: galleryDto, @Response() res): Promise<any> {
        const message = await this.galleryService.editGallery(body, req.user.id);
        console.log(message);
        res.send(JSON.stringify(message));
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Post('add_gallery')
    async addGallery(@Request() req, @Body() body: galleryDto, @Response() res): Promise<any> {
        const message = await this.galleryService.addGallery(body, req.user.id);
        console.log(message);
        res.send(JSON.stringify(message));
    }

    @SetMetadata('role', 'player')
    @UseGuards(AuthenticatedGuard, RoleGuard)
    @Post('delete_gallery')
    async deleteGall(@Request() req, @Body() body: galleryDto, @Response() res): Promise<any> {
        const message = await this.galleryService.deleteGallery(body, req.user.id);
        console.log(message);
        res.send(JSON.stringify(message));
    }
}