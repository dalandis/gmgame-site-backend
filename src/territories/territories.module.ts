import { Module } from '@nestjs/common';
import { TerritoriesController } from './territories.controlle';
import { TerritoriesService } from './territories.service';
import { UtilsService } from '../Utils/utils.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TerritoriesController],
  providers: [TerritoriesService, UtilsService],
})
export class TerritoriesModule {}
