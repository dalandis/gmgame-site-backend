import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CronTasksService } from './cron.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue(
      {
        name: 'cron-tasks',
      },
      {
        name: 'citizenship',
      },
    ),
  ],
  controllers: [],
  providers: [CronTasksService, DataProviderService],
})
export class CronTasksModule {}
