import {Module} from '@nestjs/common';
import { User } from '../users/users.model';
import { Markers } from '../markers/markers.model';
import { Territories } from '../territories/territories.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';
import { UsersConsumer } from './process-queues.service';
import { Awards } from '../awards/awards.model';
import { DataProviderService } from '../data-provider/data-provider.service';
import { LogsService } from '../logs/logs.service';
import { Logs } from '../logs/logs.model';

@Module({
    imports: [
        SequelizeModule.forFeature([User, Markers, Territories, Awards, Logs]),
        BullModule.registerQueue({
            name: 'users',
        })
    ],
    controllers: [],
    providers: [UsersConsumer, DataProviderService, LogsService],
})

export class ProcessQueuesModule {}