import {Module} from '@nestjs/common';
import { User } from '../users/users.model';
import { Awards } from '../awards/awards.model';
import { ExternalApiController } from './external-api.controller';
import { ExternalApiService } from './external-api.service';
import { UsersModule } from '../users/users.module';
import { UtilsService } from '../Utils/utils.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DataProviderService } from '../data-provider/data-provider.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { BullModule } from '@nestjs/bull';
import { LogsService } from '../logs/logs.service';
import { Logs } from '../logs/logs.model';
import { Territories } from '../territories/territories.model';

@Module({
    imports: [
        UsersModule,
        SequelizeModule.forFeature([User, Awards, Logs, Territories]),
        NestjsFormDataModule,
        BullModule.registerQueue({
            name: 'users',
        }),
    ],
    controllers: [ExternalApiController],
    providers: [ExternalApiService, UtilsService, DataProviderService, LogsService],
})

export class ExternalApiModule {}