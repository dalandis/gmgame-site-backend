import {Module} from '@nestjs/common';
import { Faq } from '../faq/faq.model';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DataProviderService } from '../data-provider/data-provider.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Faq]),
    ],
    controllers: [FaqController],
    providers: [FaqService, DataProviderService],
})

export class FaqModule {}