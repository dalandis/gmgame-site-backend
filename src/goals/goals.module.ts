import { Module } from '@nestjs/common';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoalsController],
  providers: [GoalsService, DataProviderService],
})
export class GoalsModule {}
