import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { User } from '../users/users.model';
import { Tickets } from './tickets.model';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SequelizeModule.forFeature([User, Tickets]), PrismaModule],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
