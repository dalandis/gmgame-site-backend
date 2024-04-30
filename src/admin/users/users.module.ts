import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@songkeys/nestjs-redis';
import { UserAdminController } from './users.controller';
import { UserAdminService } from './users.service';
import { LogsService } from '../../logs/logs.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'users',
    }),
    BullModule.registerQueue({
      name: 'markers',
    }),
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [UserAdminController],
  providers: [UserAdminService, LogsService],
})
export class UserAdminModule {}
