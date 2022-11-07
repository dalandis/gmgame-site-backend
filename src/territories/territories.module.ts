import {Module} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TerritoriesController } from './territories.controlle';
import { Territories } from './territories.model';
import { TerritoriesService } from './territories.service';
import { UtilsService } from '../Utils/utils.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Territories])
    ],
    controllers: [TerritoriesController],
    providers: [TerritoriesService, UtilsService],
})

export class TerritoriesModule {}