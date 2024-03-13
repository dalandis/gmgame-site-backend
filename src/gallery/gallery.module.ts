import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DataProviderService } from '../data-provider/data-provider.service';

@Module({
  controllers: [GalleryController],
  providers: [GalleryService, DataProviderService],
})
export class GalleryModule {}
