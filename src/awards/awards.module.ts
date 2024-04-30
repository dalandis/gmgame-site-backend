import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/users.model';
import { AwardsController } from './awards.controller';
import { Awards } from './awards.model';
import { AwardsService } from './awards.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SequelizeModule.forFeature([Awards, User]), PrismaModule],
  controllers: [AwardsController],
  providers: [AwardsService, DataProviderService],
})
export class AwardsModule {}
