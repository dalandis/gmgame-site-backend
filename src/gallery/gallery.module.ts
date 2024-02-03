import {Module} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GalleryController } from './gallery.controller';
import { Gallery } from './gallery.model';
import { GalleryService } from './gallery.service';
import { UtilsService } from '../Utils/utils.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Gallery])
    ],
    controllers: [GalleryController],
    providers: [GalleryService, UtilsService],
})

export class GalleryModule {}