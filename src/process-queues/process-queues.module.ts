import {Module} from '@nestjs/common';
import { User } from '../users/users.model';
import { Markers } from '../markers/markers.model';
import { Territories } from '../territories/territories.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';
import { UsersConsumer } from './users-queues.service';
import { Awards } from '../awards/awards.model';
import { DataProviderService } from '../data-provider/data-provider.service';
import { LogsService } from '../logs/logs.service';
import { Logs } from '../logs/logs.model';
import { CronTasksConsumer } from './tasks-queues.service';
import { Regens } from '../admin/users/regens.model';

@Module({
    imports: [
        SequelizeModule.forFeature([User, Markers, Territories, Awards, Logs, Regens]),
        BullModule.registerQueue(
            {
                name: 'users',
            },
            {
                name: 'cron-tasks',
            },
            {
                name: 'markers',
            }
        )
    ],
    controllers: [],
    providers: [UsersConsumer, DataProviderService, LogsService, CronTasksConsumer],
})

export class ProcessQueuesModule {}