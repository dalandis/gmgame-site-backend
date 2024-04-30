import { Module } from '@nestjs/common';
import { AwardsController } from './awards.controller';
import { AwardsService } from './awards.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AwardsController],
  providers: [AwardsService, DataProviderService],
})
export class AwardsModule {}
