import { Injectable } from '@nestjs/common';
import { rewardsDto } from '../validator/give.rewards';
import { ConfigModule } from '@nestjs/config';
import { awards } from '@prisma/client';
import { DataProviderService } from '../data-provider/data-provider.service';
import { PrismaService } from '../prisma/prisma.service';

ConfigModule.forRoot({
  envFilePath: '.env.discord',
});

@Injectable()
export class AwardsService {
  constructor(
    private readonly dataProviderService: DataProviderService,
    private readonly prismaService: PrismaService,
  ) {}

  async getAwards(user: string): Promise<awards[]> {
    return this.prismaService.awards.findMany({
      where: {
        user_id: user,
        issued: false,
      },
    });
  }

  async giveReward(params: rewardsDto, user_id: string): Promise<Record<string, string>> {
    try {
      const reward = await this.prismaService.awards.findFirst({
        where: {
          id: params.rewardId,
          issued: false,
          user_id: user_id,
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      if (!reward) {
        return { error: 'Награды не существует' };
      }

      const payload = {
        prize: reward.type,
        nick: reward.user.username,
      };

      const result = await this.dataProviderService.sendToServerApi(payload, 'casino_new', 'POST');

      if (result.status != 200) {
        return { error: `Награда не выдана: ${result.status}` };
      }

      await this.prismaService.awards.update({
        where: {
          id: params.rewardId,
          issued: false,
          user_id: user_id,
        },
        data: {
          issued: true,
        },
      });

      const dataDiscord = `Поздравляем, ${reward.user.username}! Выигрыш ${result.data.prize}`;
      this.dataProviderService.sendDiscordWebHook(dataDiscord, 'Yakubovich');

      return { message: 'Награда выдана' };
    } catch (err) {
      return { error: `Ошибка при выдаче награды: ${err}` };
    }
  }
}
