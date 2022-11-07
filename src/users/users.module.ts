import {Module} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './users.controlle';
import { User } from './users.model';
import { UsersService } from './users.service';
import { UtilsService } from '../Utils/utils.service';

@Module({
    imports: [
        SequelizeModule.forFeature([User])
    ],
    controllers: [UsersController],
    providers: [UsersService, UtilsService],
})

export class UsersModule {}