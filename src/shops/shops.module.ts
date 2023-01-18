import {Module} from '@nestjs/common';
import { User } from '../users/users.model';
import { Awards } from '../awards/awards.model';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { UsersModule } from '../users/users.module';
import { UtilsService } from '../Utils/utils.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DataProviderService } from '../data-provider/data-provider.service';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
    imports: [
        NestjsFormDataModule
    ],
    controllers: [ShopsController],
    providers: [ShopsService, UtilsService, DataProviderService],
})

export class ShopsModule {}