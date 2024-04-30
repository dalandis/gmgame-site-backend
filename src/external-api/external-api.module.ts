import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { BullModule } from '@nestjs/bull';
import { ExternalApiController } from './external-api.controller';
import { ExternalApiService } from './external-api.service';
import { UsersModule } from '../users/users.module';
import { UtilsService } from '../Utils/utils.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import { LogsService } from '../logs/logs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    NestjsFormDataModule,
    BullModule.registerQueue({
      name: 'users',
    }),
  ],
  controllers: [ExternalApiController],
  providers: [ExternalApiService, UtilsService, DataProviderService, LogsService],
})
export class ExternalApiModule {}
