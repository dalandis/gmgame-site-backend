import { Module } from '@nestjs/common';
import { DataProviderService } from '../data-provider/data-provider.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

@Module({
  imports: [PrismaModule],
  controllers: [ShopController],
  providers: [ShopService, DataProviderService],
})
export class ShopModule {}
