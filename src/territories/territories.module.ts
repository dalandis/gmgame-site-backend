import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TerritoriesController } from './territories.controlle';
import { Territories } from './territories.model';
import { TerritoriesService } from './territories.service';
import { UtilsService } from '../Utils/utils.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SequelizeModule.forFeature([Territories]), PrismaModule],
  controllers: [TerritoriesController],
  providers: [TerritoriesService, UtilsService],
})
export class TerritoriesModule {}
