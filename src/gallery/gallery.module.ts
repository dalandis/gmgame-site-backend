import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DataProviderService } from '../data-provider/data-provider.service';
import { User } from '../users/users.model';
import { Gallery, UsersGallery } from './gallery.model';
import { GalleryImages } from './gallery-images.model';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SequelizeModule.forFeature([User, Gallery, UsersGallery, GalleryImages]), PrismaModule],
  controllers: [GalleryController],
  providers: [GalleryService, DataProviderService],
})
export class GalleryModule {}
