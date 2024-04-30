import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GalleryController],
  providers: [GalleryService, DataProviderService],
})
export class GalleryModule {}
