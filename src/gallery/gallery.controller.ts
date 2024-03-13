import {
  Controller,
  UseGuards,
  Post,
  SetMetadata,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RoleGuard } from '../auth/roles/api-roles';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import * as multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/webp') {
    callback(null, true);
  } else {
    callback(new BadRequestException('Invalid file type'), false);
  }
};

@Controller('/api')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @SetMetadata('role', 'player')
  @UseGuards(AuthenticatedGuard, RoleGuard)
  @Post('/upload_images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter,
    }),
  )
  async uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.galleryService.saveImages(files);
  }
}
