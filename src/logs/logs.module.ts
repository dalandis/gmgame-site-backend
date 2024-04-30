import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [LogsService],
})
export class LogsModule {}
