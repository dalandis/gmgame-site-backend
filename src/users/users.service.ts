import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from './users.model';
import { DataProviderService } from '../data-provider/data-provider.service';
import { UtilsService } from '../Utils/utils.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        private readonly dataProviderService: DataProviderService,
        private readonly utilsService: UtilsService
    ) {}

    async getUser(user_id: string): Promise<User> {
        return this.userModel.findOne({
            where: {
                user_id,
            }
        });
    }

    async addUser(params, discordUser): Promise<Record<string,string>> {
        const user = await this.userModel.findOne({
            where: {
                [Op.or]: [
                    {user_id: discordUser.id},
                    {username: params.login}
                ]
            }
        });

        if (user) {
            return {error: 'user exist'};
        }

        await this.userModel.create({ 
            username: params.login,
            password: params.password,
            tag: JSON.stringify(discordUser),
            type: params.type,
            age: params.age,
            from_about: params.from_about,
            you_about: params.you_about,
            status: 1,
            user_id: discordUser.id,
            partner: 'gmgame',
            reg_date: Date.now()
        });

        await this.sendWebhook(params, discordUser);

        return {message: 'user create successful'};
    }

    private async sendWebhook(params, discordUser) {
       const data = `
            (test)
            Игровой ник: ${params.login}
            Аккаунт: ${this.utilsService.getAccountType(params.type)}
            Возраст: ${params.age}
            Предыдущие сервера: ${params.servers}
            Откуда узнали о проекте: ${params.from_about}
            Интересы в Minecraft: ${params.you_about}
            Заявка от: ${params.partner}
            Дискорд: ${this.utilsService.getDiscord(discordUser)}
            <@${discordUser.id}>
        `;

        this.dataProviderService.sendDiscordWebHook(data, 'applicant');
    }

    async changePassword(params, user) {
        const payload = {
            password: params.password,
            username: user.localuser.username
        };

        const result = await this.dataProviderService.sendToServerApi(payload, '/change_password_new', 'POST');
        
        if (result.status != 200) {
            return {error: `password is not change: ${result.status}`};
        }

        return {message: 'password is change'};
     }
}
