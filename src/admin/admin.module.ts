import { Module } from '@nestjs/common';
import { UserAdminModule } from './users/users.module';
import { ShopItemsAdminModule } from './shop-items/shop-items.module';

@Module({
  imports: [UserAdminModule, ShopItemsAdminModule],
})
export class AdminModule {}
