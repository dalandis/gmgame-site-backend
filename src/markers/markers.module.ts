import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MarkersController } from './markers.controlle';
import { Markers } from './markers.model';
import { MarkersService } from './markers.service';
import { UtilsService } from '../Utils/utils.service';
import { User } from '../users/users.model';
import { BullModule } from '@nestjs/bull';
import { LogsService } from '../logs/logs.service';
import { Logs } from '../logs/logs.model';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Markers, User, Logs]),
    BullModule.registerQueue({
      name: 'markers',
    }),
    PrismaModule,
  ],
  controllers: [MarkersController],
  providers: [MarkersService, UtilsService, LogsService],
})
export class MarkersModule {}
