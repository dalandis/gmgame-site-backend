import {Module} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './users.controlle';
import { User } from './users.model';
import { UsersService } from './users.service';

@Module({
    imports: [
        SequelizeModule.forFeature([User])
    ],
    controllers: [UsersController],
    providers: [UsersService],
})

export class UsersModule {}