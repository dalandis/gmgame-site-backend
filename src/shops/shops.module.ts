import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { UtilsService } from '../Utils/utils.service';
import { DataProviderService } from '../data-provider/data-provider.service';

@Module({
  imports: [NestjsFormDataModule],
  controllers: [ShopsController],
  providers: [ShopsService, UtilsService, DataProviderService],
})
export class ShopsModule {}
