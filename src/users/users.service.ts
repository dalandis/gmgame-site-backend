import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from './users.model';
import { DataProviderService } from '../data-provider/data-provider.service';
import { UtilsService } from '../Utils/utils.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        private readonly dataProviderService: DataProviderService,
        private readonly utilsService: UtilsService,
        @InjectQueue('users') 
        private usersQueue: Queue,
    ) {}

    async getUser(user_id: string): Promise<User> {
        return this.userModel.findOne({
            where: {
                user_id,
            },
            attributes: ['status', 'username']
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

        if (user && user.username) {
            return {error: 'user exist'};
        }

        // await this.userModel.create({ 
        //     username: params.login,
        //     password: params.password,
        //     tag: JSON.stringify(discordUser),
        //     type: params.type,
        //     age: params.age,
        //     from_about: params.from_about,
        //     you_about: params.you_about,
        //     status: 1,
        //     user_id: discordUser.id,
        //     partner: 'gmgame',
        //     reg_date: new Date()
        // });
        //with upset

        let discordResponse = null;

        try {
            discordResponse = await this.dataProviderService.sendToBot({user: discordUser.id}, 'check_user_define', 'POST');
        } catch (error) {
            console.log(error);
            return {error: 'discord error'};
        }

        await this.userModel.upsert({
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
            reg_date: new Date(),
            expiration_date: new Date(),
            is_discord: discordResponse?.data?.data || false
        });

        // this.sendWebhook(params, discordUser);

        return {message: 'user create successful'};
    }

    private async sendWebhook(params, discordUser) {
//         const data = '```' + `
// Игровой ник: ${params.login}
// Аккаунт: ${this.utilsService.getAccountType(params.type)}
// Возраст: ${params.age}
// Предыдущие сервера: ${params.servers}
// Откуда узнали о проекте: ${params.from_about}
// Интересы в Minecraft: ${params.you_about}
// Заявка от: ${params.partner || 'gmgame'}
// Ник друга: ${params.friend_name || 'нет'}
// Дискорд: ${this.utilsService.getDiscord(discordUser)}` + '```' + `
// <@${discordUser.id}>`;

        const payload = {
            login: params.login,
            account: this.utilsService.getAccountType(params.type),
            age: params.age,
            servers: params.servers,
            from_about: params.from_about,
            you_about: params.you_about,
            partner: params.partner || 'gmgame',
            friend_name: params.friend_name || 'нет',
            discord: this.utilsService.getDiscord(discordUser),
            discordId: discordUser.id,
        }

        const job = await this.usersQueue.getJob(`${discordUser.id}-create-new-user-ticket`);

        if (job && job.data.action === `create-new-user-ticket`) {
            return {error: true,  message: 'Уже есть такая заявка'};
        }

        this.usersQueue.add(
            {
                action: `create-new-user-ticket`,
                id: discordUser.id,
                username: params.login,
                manager: discordUser.id,
                managerName: params.login,
                payload: payload,
                noLog: true
            },
            {
                jobId: `${discordUser.id}-create-new-user-ticket`,
                removeOnComplete: false,
            }
        );

        // this.dataProviderService.sendToBot({ticket: data, name: params.login}, 'new_ticket', 'POST');
        // this.dataProviderService.sendToBot(payload, 'create_ticket', 'POST');
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
