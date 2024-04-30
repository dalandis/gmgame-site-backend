import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { UsersController } from './users.controlle';
import { UsersService } from './users.service';
import { UtilsService } from '../Utils/utils.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'users',
    }),
    PrismaModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UtilsService, DataProviderService],
  exports: [UsersService],
})
export class UsersModule {}
