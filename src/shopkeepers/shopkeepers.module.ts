import { Module } from '@nestjs/common';
import { ShopkeepersController } from './shopkeepers.controller';
import { ShopkeepersService } from './shopkeepers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShopkeepersController],
  providers: [ShopkeepersService],
})
export class ShopkeepersModule {}
