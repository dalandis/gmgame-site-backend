import {Module} from '@nestjs/common';
import { User } from '../../users/users.model';
import { Markers } from '../../markers/markers.model';
import { Territories } from '../../territories/territories.model';
import { UserAdminController } from './users.controller';
import { UserAdminService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';
import { LogsService } from '../../logs/logs.service';
import { Logs } from '../../logs/logs.model';
import { Regens } from './regens.model';
import { Tickets } from '../../tickets/tickets.model';
import { OldUser } from '../../users/old-user.model';

@Module({
    imports: [
        SequelizeModule.forFeature([User, Markers, Territories, Logs, Regens, Tickets, OldUser]),
        BullModule.registerQueue({
            name: 'users',
        }),
        BullModule.registerQueue({
            name: 'markers'
        })
    ],
    controllers: [UserAdminController],
    providers: [UserAdminService, LogsService],
})

export class UserAdminModule {}