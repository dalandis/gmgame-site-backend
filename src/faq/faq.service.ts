import { Injectable } from '@nestjs/common';
import { saveFaqDto } from '../validator/faq';
import { DataProviderService } from '../data-provider/data-provider.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaqService {
  constructor(
    private readonly dataProviderService: DataProviderService,
    private readonly prismaService: PrismaService,
  ) {}

  async saveFaq(data: saveFaqDto): Promise<any> {
    let faq = await this.prismaService.faq.findUnique({
      where: {
        id: data.id,
      },
    });

    if (faq) {
      await this.prismaService.faq.update({
        where: {
          id: data.id,
        },
        data,
      });
    } else {
      delete data.id;
      faq = await this.prismaService.faq.create({
        data,
      });
    }
    return { message: 'Сохранено', quest: faq };
  }

  async getMentions(): Promise<any> {
    const mentions = await this.dataProviderService.sendToBot({}, 'get_mentions', 'POST');

    console.log(mentions.data);
    return mentions.data;
  }

  async getFaq(): Promise<any> {
    const faq = await this.prismaService.faq.findMany();

    return faq;
  }

  async publishFaq(): Promise<any> {
    const faq = await this.prismaService.faq.findMany();

    const data = {
      faq: faq,
    };

    this.dataProviderService.sendToBot(data, 'send_faq', 'POST');
  }
}
