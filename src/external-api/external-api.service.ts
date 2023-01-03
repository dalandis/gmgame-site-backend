import { Injectable } from '@nestjs/common';
import { createUserDto, checkUserDto, decisionUserDto } from '../validator/external-api/create-user';
import { ConfigModule } from '@nestjs/config';
import {UsersService} from '../users/users.service';
import { User } from '../users/users.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { UtilsService } from '../Utils/utils.service';
import { DataProviderService } from '../data-provider/data-provider.service';

ConfigModule.forRoot({
    envFilePath: '.env.discord'
});

@Injectable()
export class ExternalApiService {
    constructor(
        private readonly userService: UsersService,
        @InjectModel(User)
        private userModel: typeof User,
        private readonly utilsService: UtilsService,
        private readonly dataProviderService: DataProviderService,
    ) {}

    async createUser(params: createUserDto, username: string): Promise<Record<string,string|number>> {
        try {
            params.partner ||= username;

            const result = await this.userService.addUser(params, params.user_json);

            if (result.error) {
                return { 'error': result.error, 'status_code': 400, 'success': '' };
            }

            const data = `
                (test)
                Игровой ник: ${params.login}
                Аккаунт: ${this.utilsService.getAccountType(params.type)}
                Возраст: ${params.age}
                Предыдущие сервера: ${params.servers}
                Откуда узнали о проекте: ${params.from_about}
                Интересы в Minecraft: ${params.you_about}
                Заявка от: ${params.partner}
                Дискорд: ${this.utilsService.getDiscord(params.user_json)}
                <@${params.user_json.id}>
            `;

            this.dataProviderService.sendDiscordWebHook(data, 'applicant');

            return {'success': 'registration successful', 'status_code': 200, 'error': '' };
        } catch (err) {
            return { 'error': 'unknown error', 'status_code': 400, 'success': '' };
        }
    }

    async getStatus(userId: string): Promise<Record<string,string|number>> {
        try{
            const user = await this.userModel.findOne({
                where: {
                    user_id: userId,
                },
                attributes: ['status']
            });

            return { "error": "", "status_code": 200, "status": user.status };
        } catch (err) {
            return { "error": "unknown error", "status_code": 400, "status": null };
        }
    }

    async checkUser(params: checkUserDto): Promise<Record<string,string|number|Record<string,string>>> {
        try{
            const user = await this.userModel.findOne({
                where: {
                    [Op.or]: [
                        {user_id: params.user},
                        {username: params.user}
                    ]
                },
                attributes: ['username', 'status', 'tag', 'type', 'user_id']
            });

            console.log(user.tag);

            const tag = JSON.parse(user.tag);

            return {
                "success": "ok", "status_code": 200, "error": "", 
                "data": {
                    "username": user.username,
                    "status": await this.utilsService.getStatus(user.status),
                    "tag": tag.username + "#" + tag.discriminator,
                    "type": user.type ? "Лицензия" : "Пиратка",
                    "discord_id": user.user_id
                }
            }
        } catch (err) {
            console.log(err);
            return { "error": "unknown error", "status_code": 400, "status": null };
        }
    }

    async acceptUser(params: decisionUserDto): Promise<Record<string,string|number>> {
        try{
            const user = await this.userModel.findOne({
                where: {
                    user_id: params.user
                },
                attributes: ['username', 'password', 'type']
            });

            const payload = {
                "username" : user.username,
                "password" : user.password,
                "type" : user.type
            }

            const response = await this.dataProviderService.sendToServerApi(payload, 'add_user_new', 'POST');

            if (response.status != 200) {
                return { "error": `error add user, ${response.status}`, "status_code": 400, "status": null }
            }

            await this.userModel.update(
                {
                    status: 2
                },
                {
                    where: {
                        user_id: params.user
                    }
                }
            );

            return {"success": "ok", "status_code": 200, "error": "", "data": "" };
        } catch (err) {
            return { "error": "unknown error", "status_code": 400, "status": null };
        }
    }

    async denyUser(params: decisionUserDto): Promise<Record<string,string|number>> {
        try{
            await this.userModel.update(
                {
                    status: 3
                },
                {
                    where: {
                        user_id: params.user
                    }
                }
            );

            return {"success": "ok", "status_code": 200, "error": "", "data": "" };
        } catch (err) {
            return { "error": "unknown error", "status_code": 400, "status": null };
        }
    }
}
