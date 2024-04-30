import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { UsersModule } from '../users/users.module';
import { UtilsService } from '../Utils/utils.service';
import { DataProviderService } from '../data-provider/data-provider.service';

@Module({
  imports: [UsersModule, NestjsFormDataModule],
  controllers: [StatisticsController],
  providers: [StatisticsService, UtilsService, DataProviderService],
})
export class StatisticsModule {}
