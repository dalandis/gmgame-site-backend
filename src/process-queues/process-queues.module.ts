import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { UsersConsumer } from './users-queues.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import { LogsService } from '../logs/logs.service';
import { CronTasksConsumer } from './tasks-queues.service';
import { MarkersConsumer } from './markers-queues.service';
import { CitizenshipConsumer } from './citizenship-queues.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
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
