import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ShopItemsAdminController } from './shop-items.controller';
import { ShopItemsAdminService } from './shop-items.service';

@Module({
  imports: [PrismaModule],
  controllers: [ShopItemsAdminController],
  providers: [ShopItemsAdminService],
})
export class ShopItemsAdminModule {}
