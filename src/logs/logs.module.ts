import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Logs } from './logs.model';
import { LogsService } from './logs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SequelizeModule.forFeature([Logs]), PrismaModule],
  controllers: [],
  providers: [LogsService],
})
export class LogsModule {}
