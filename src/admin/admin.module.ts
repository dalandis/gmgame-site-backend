import { Module } from '@nestjs/common';
import { UserAdminModule } from './users/users.module';
import { AdminQueuesModule } from './queues/queues.module';
import { ShopItemsAdminModule } from './shop-items/shop-items.module';

@Module({
  imports: [UserAdminModule, ShopItemsAdminModule, AdminQueuesModule],
})
export class AdminModule {}
