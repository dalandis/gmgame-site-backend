import { Module } from '@nestjs/common';
import { User } from '../users/users.model';
import { Awards } from '../awards/awards.model';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserAdminModule } from './users/users.module';
import { UtilsService } from '../Utils/utils.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DataProviderService } from '../data-provider/data-provider.service';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
    imports: [
        UserAdminModule
    ],
    // controllers: [AdminController],
    // providers: [AdminService, UtilsService, DataProviderService],
})

export class AdminModule {}