import { Module } from '@nestjs/common';
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
import { MarkersConsumer } from './markers-queues.service';
import { CitizenshipConsumer } from './citizenship-queues.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Markers, Territories, Awards, Logs, Regens]),
    PrismaModule,
    BullModule.registerQueue(
      {
        name: 'users',
      },
      {
        name: 'cron-tasks',
      },
      {
        name: 'markers',
      },
      {
        name: 'citizenship',
      },
    ),
  ],
  controllers: [],
  providers: [
    UsersConsumer,
    DataProviderService,
    LogsService,
    CronTasksConsumer,
    MarkersConsumer,
    CitizenshipConsumer,
  ],
})
export class ProcessQueuesModule {}
