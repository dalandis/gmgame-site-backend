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

@Module({
    imports: [
        UsersModule,
        SequelizeModule.forFeature([User, Awards]),
        NestjsFormDataModule,
        BullModule.registerQueue({
            name: 'users',
        }),
    ],
    controllers: [ExternalApiController],
    providers: [ExternalApiService, UtilsService, DataProviderService],
})

export class ExternalApiModule {}