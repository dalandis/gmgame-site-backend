import {Module} from '@nestjs/common';
import { User } from '../../users/users.model';
import { UserAdminController } from './users.controller';
import { UserAdminService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
    imports: [
        SequelizeModule.forFeature([User])
    ],
    controllers: [UserAdminController],
    providers: [UserAdminService],
})

export class UserAdminModule {}