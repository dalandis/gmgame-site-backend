import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Awards } from '../awards/awards.model';
import { Markers } from '../markers/markers.model';
import { UsersController } from './users.controlle';
import { UsersService } from './users.service';
import { UtilsService } from '../Utils/utils.service';
import { User } from './users.model'
import { DataProviderService } from '../data-provider/data-provider.service';
import { Territories } from '../territories/territories.model';
import { BullModule } from '@nestjs/bull';
import { OldUser } from './old-user.model';

@Module({
    imports: [
        SequelizeModule.forFeature([User, Awards, Markers, Territories, OldUser]),
        BullModule.registerQueue({
            name: 'users',
        }),
    ],
    controllers: [UsersController],
    providers: [UsersService, UtilsService, DataProviderService],
    exports: [UsersService]
})

export class UsersModule {}