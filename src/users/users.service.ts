import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from './users.model';
import axios from "axios";
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot({
    envFilePath: '.env.discord'
});

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
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

        console.log(user);

        if (user) {
            return {error: 'user exist'};
        }

        await this.userModel.create({ 
            username: params.login,
            password: params.password,
            tag: JSON.stringify(user),
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
            Игровой ник: ${params.login}
            Аккаунт: ${await this.getAccountType(params.type)}
            Возраст: ${params.age}
            Предыдущие сервера: ${params.servers}
            Откуда узнали о проекте: ${params.from_about}
            Интересы в Minecraft: ${params.you_about}
            Заявка от: ${params.partner}
            Дискорд: ${await this.getDiscord(discordUser)}
            <@${discordUser.id}>
        `;

        await axios.request({
            data: {
                content: data,
                username: 'applicant',
                allowed_mentions: {
                    parse: ['users'],
                    users: []
                }
            },
            headers: { "Content-Type": "application/json" },
            method: 'POST',
            url: process.env.URL_WEBHOOK_FOR_REG
        })
    }

    private async getAccountType(type: number): Promise<string> {
        if (type == 1) {
            return 'Лицензия';
        }

        return 'Пиратка';
    }

    private async getDiscord(discordUser): Promise<string> {
        if (discordUser.discriminator) {
            return `${discordUser.username}#${discordUser.discriminator}`;
        }

        return discordUser.id;
    }
}
