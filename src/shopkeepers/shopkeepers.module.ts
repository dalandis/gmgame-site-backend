import { Module } from '@nestjs/common';
import { ShopkeepersController } from './shopkeepers.controller';
import { ShopkeepersService } from './shopkeepers.service';

@Module({
  controllers: [ShopkeepersController],
  providers: [ShopkeepersService],
})
export class ShopkeepersModule {}
