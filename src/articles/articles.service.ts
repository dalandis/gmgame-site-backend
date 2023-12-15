import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
// import { rewardsDto } from '../validator/give.rewards';
import { Articles } from './articles.model';
import { User } from '../users/users.model';
import { ConfigModule } from '@nestjs/config';
import { DataProviderService } from '../data-provider/data-provider.service';

ConfigModule.forRoot({
    envFilePath: '.env.discord'
});

@Injectable()
export class ArticlesService {
    constructor(
        @InjectModel(Articles)
        private articlesModel: typeof Articles,
        @InjectModel(User)
        private userModel: typeof User,
        private readonly dataProviderService: DataProviderService
    ) {}

    async getArticles(user: string): Promise<Articles[]> {
        return this.articlesModel.findAll({
            where: {
                user_id: user,
            }
        });
    }

    async getArticle(id: string): Promise<Articles> {
        return this.articlesModel.findOne({
            where: {
                id: id,
            }
        });
    }

    // async giveReward(params: rewardsDto, user_id: string): Promise<Record<string,string>> {
    //     try {
    //         const reward = await this.awardsModel.findOne({
    //             include: [{
    //                 model: this.userModel,
    //                 attributes: ['username']
    //             }],
    //             where: {
    //                 id: params.rewardId,
    //                 issued: 0,
    //                 user_id: user_id
    //             },
    //         });

    //         if (!reward) {
    //             return {error: 'reward not exist'};
    //         }

    //         const payload = {
    //             prize: reward.type,
    //             nick : reward.user.username
    //         };

    //         const result = await this.dataProviderService.sendToServerApi(payload, 'casino_new', 'POST');
            
    //         if (result.status != 200) {
    //             return {error: `reward is not give: ${result.status}`};
    //         }

    //         await this.awardsModel.update(
    //             {
    //                 issued: 1
    //             },
    //             {
    //                 where: {
    //                     user_id: user_id,
    //                     issued: 0,
    //                     id: params.rewardId
    //                 }
    //             }
    //         );

    //         const dataDiscord = `Поздравляем, ${reward.user.username}! Выигрыш ${result.data.prize}`;
    //         this.dataProviderService.sendDiscordWebHook(dataDiscord, 'Yakubovich');

    //         return {message: 'reward is give'};
    //     } catch (err) {
    //         return {error: `update error: ${err}`};
    //     } 
    // }
}
