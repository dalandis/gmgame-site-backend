import { Module } from '@nestjs/common';
import { DataProviderService } from './data-provider.service';

@Module({
  providers: [DataProviderService],
})
export class DataProviderMpdule {}
