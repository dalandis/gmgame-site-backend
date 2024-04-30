import { Module } from '@nestjs/common';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FaqController],
  providers: [FaqService, DataProviderService],
})
export class FaqModule {}
