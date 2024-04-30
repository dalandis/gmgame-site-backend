import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MarkersController } from './markers.controlle';
import { MarkersService } from './markers.service';
import { UtilsService } from '../Utils/utils.service';
import { LogsService } from '../logs/logs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'markers',
    }),
    PrismaModule,
  ],
  controllers: [MarkersController],
  providers: [MarkersService, UtilsService, LogsService],
})
export class MarkersModule {}
