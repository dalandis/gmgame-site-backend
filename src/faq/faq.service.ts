import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { saveFaqDto } from '../validator/faq';
import { Faq } from './faq.model';
import { UtilsService, IWorldType } from '../Utils/utils.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { LogsService } from '../logs/logs.service';
import { DataProviderService } from '../data-provider/data-provider.service';

@Injectable()
export class FaqService {
    constructor(
        @InjectModel(Faq)
        private faqModel: typeof Faq,
        private readonly dataProviderService: DataProviderService,
    ) {}

    async saveFaq(data: saveFaqDto): Promise<any> {
        let faq = await this.faqModel.findOne({ where: { id: data.id } });

        if (faq) {
            await this.faqModel.update(data, { where: { id: data.id } });
        } else {
            delete data.id;
            faq = await this.faqModel.create(data);
        }
        return {message: 'Сохранено', quest: faq};
    }

    async getMentions(): Promise<any> {
        const mentions = await this.dataProviderService.sendToBot({}, 'get_mentions', 'POST');

        console.log(mentions.data)
        return mentions.data;
    }

    async getFaq(): Promise<any> {
        const faq = await this.faqModel.findAll();
        return faq;
    }

    async publishFaq(): Promise<any> {
        const faq = await this.faqModel.findAll();

        const data = {
            faq: faq
        };

        this.dataProviderService.sendToBot(data, 'send_faq', 'POST');
    }
}
