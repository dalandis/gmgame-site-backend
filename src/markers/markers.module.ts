import {Module} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MarkersController } from './markers.controlle';
import { Markers } from './markers.model';
import { MarkersService } from './markers.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Markers])
    ],
    controllers: [MarkersController],
    providers: [MarkersService],
})

export class MarkersModule {}