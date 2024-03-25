import {
  Controller,
  UseGuards,
  Post,
  SetMetadata,
  UploadedFiles,
  BadRequestException,
  Get,
  Request,
  Body,
  Response,
  Param,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RoleGuard } from '../auth/roles/api-roles';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import * as multer from 'multer';
import { deleteAproveRejectGalleryDto, galleryDto } from '../validator/gallery';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/webp' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/avif'
  ) {
    callback(null, true);
  } else {
    callback(new BadRequestException('Invalid file type'), false);
  }
};

@Controller('/api')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  // @SetMetadata('role', 'player')
  // @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/upload_images')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter,
    }),
  )
  async uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.galleryService.saveImages(files);
  }

  @Get('get_galleries')
  async getGalleries() {
    return this.galleryService.getGalleries();
  }

  @SetMetadata('role', 'player')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/create_gallery')
  async createGallery(
    @Request() req,
    @Body() body: galleryDto,
    @Response() res,
  ) {
    const message = this.galleryService.createGallery(body, req.user);

    res.send(JSON.stringify(message));
  }

  @Get('get_gallery/:id')
  async getGallery(@Param() params, @Request() req) {
    return this.galleryService.getGallery(params.id, req.user);
  }

  @SetMetadata('role', 'player')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('edit_gallery')
  async editGallery(@Request() req, @Body() body: galleryDto, @Response() res) {
    const message = this.galleryService.editGallery(body, req.user);

    res.send(JSON.stringify(message));
  }

  @SetMetadata('role', 'player')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('delete_gallery')
  async deleteGallery(
    @Request() req,
    @Body() body: deleteAproveRejectGalleryDto,
    @Response() res,
  ) {
    const message = this.galleryService.deleteGallery(body.id, req.user);

    res.send(JSON.stringify(message));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('approve_gallery')
  async approveGallery(
    @Request() req,
    @Body() body: deleteAproveRejectGalleryDto,
    @Response() res,
  ) {
    const message = this.galleryService.approveGallery(body.id);

    res.send(JSON.stringify(message));
  }

  @SetMetadata('role', 'admin')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('reject_gallery')
  async rejectGallery(
    @Request() req,
    @Body() body: deleteAproveRejectGalleryDto,
    @Response() res,
  ) {
    const message = this.galleryService.rejectGallery(body.id);

    res.send(JSON.stringify(message));
  }
}
