import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AdminQueuesController } from './queues.controller';
import { AdminQueuesService } from './queues.service';

@Module({
  imports: [
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
  controllers: [AdminQueuesController],
  providers: [AdminQueuesService],
  exports: [AdminQueuesService],
})
export class AdminQueuesModule {}
