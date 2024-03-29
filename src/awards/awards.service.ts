import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { rewardsDto } from '../validator/give.rewards';
import { Awards } from './awards.model';
import { User } from '../users/users.model';
import { ConfigModule } from '@nestjs/config';
import { DataProviderService } from '../data-provider/data-provider.service';

ConfigModule.forRoot({
    envFilePath: '.env.discord'
});

@Injectable()
export class AwardsService {
    constructor(
        @InjectModel(Awards)
        private awardsModel: typeof Awards,
        @InjectModel(User)
        private userModel: typeof User,
        private readonly dataProviderService: DataProviderService
    ) {}

    async getAwards(user: string): Promise<Awards[]> {
        return this.awardsModel.findAll({
            where: {
                user_id: user,
                issued: 0
            }
        });
    }

    async giveReward(params: rewardsDto, user_id: string): Promise<Record<string,string>> {
        try {
            const reward = await this.awardsModel.findOne({
                include: [{
                    model: this.userModel,
                    attributes: ['username']
                }],
                where: {
                    id: params.rewardId,
                    issued: 0,
                    user_id: user_id
                },
            });

            if (!reward) {
                return {error: 'Награды не существует'};
            }

            const payload = {
                prize: reward.type,
                nick : reward.user.username
            };

            const result = await this.dataProviderService.sendToServerApi(payload, 'casino_new', 'POST');
            
            if (result.status != 200) {
                return {error: `Награда не выдана: ${result.status}`};
            }

            await this.awardsModel.update(
                {
                    issued: 1
                },
                {
                    where: {
                        user_id: user_id,
                        issued: 0,
                        id: params.rewardId
                    }
                }
            );

            const dataDiscord = `Поздравляем, ${reward.user.username}! Выигрыш ${result.data.prize}`;
            this.dataProviderService.sendDiscordWebHook(dataDiscord, 'Yakubovich');

            return {message: 'Награда выдана'};
        } catch (err) {
            return {error: `Ошибка при выдаче награды: ${err}`};
        } 
    }
}
