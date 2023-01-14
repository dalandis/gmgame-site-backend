import {Module} from '@nestjs/common';
import { User } from '../users/users.model';
import { Awards } from '../awards/awards.model';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { UsersModule } from '../users/users.module';
import { UtilsService } from '../Utils/utils.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DataProviderService } from '../data-provider/data-provider.service';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
    imports: [
        UsersModule,
        SequelizeModule.forFeature([User, Awards]),
        NestjsFormDataModule
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService, UtilsService, DataProviderService],
})

export class StatisticsModule {}