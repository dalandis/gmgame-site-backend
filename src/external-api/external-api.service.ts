import { Injectable } from '@nestjs/common';
import { createUserDto, checkUserDto, decisionUserDto } from '../validator/external-api/create-user';
import { ConfigModule } from '@nestjs/config';
import {UsersService} from '../users/users.service';
import { User } from '../users/users.model';
import { Awards } from '../awards/awards.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { UtilsService } from '../Utils/utils.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import * as crypto from 'crypto';

ConfigModule.forRoot({
    envFilePath: '.env.api'
});

interface ISignData{
    project?: string,
    timestamp: string,
    username: string,
    signature: string
}

@Injectable()
export class ExternalApiService {
    constructor(
        private readonly userService: UsersService,
        @InjectModel(User)
        private userModel: typeof User,
        @InjectModel(Awards)
        private awardsModel: typeof Awards,
        private readonly utilsService: UtilsService,
        private readonly dataProviderService: DataProviderService
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

    async voteHandler(params): Promise<Record<string,string|number>> {
        try{
            const username = params.username || params.nick;

            const signData: ISignData = {
                project: params.project,
                timestamp: params.timestamp || params.time,
                username: username,
                signature: params.signature || params.sign
            }

            if (this.checkSign(signData)) {
                return { "error": "Переданные данные не прошли проверку", "status_code": 400, "status": null };
            }

            const prize: string = this.getPrize();

            const dataToBot = {
                username: username,
                prize: prize
            };

            this.dataProviderService.sendToBot(dataToBot, 'send_embed', 'POST');

            if (!prize) { 
                return {"success": "ok", "status_code": 200, "error": "", "data": "" };
            };

            const user = await this.userModel.findOne({
                where: {
                    username: username
                },
                attributes: ['user_id']
            });

            if (user?.user_id) {
                await this.awardsModel.create({ 
                    type: prize,
                    user_id: user.user_id,
                    issued: 0
                });
            }

            return {"success": "ok", "status_code": 200, "error": "", "data": "" };
        } catch (err) {
            return { "error": "unknown error", "status_code": 400, "status": null };
        }
    }

    private checkSign(params: ISignData): boolean {
        let selfSign: string;

        if (params.project) {
            const secretString = [params.project, process.env.SECRET_KEY_FOR_VOTE_MINESERV, params.timestamp, params.username].join('.');

            selfSign = crypto.createHash('sha256').update(secretString).digest("hex");
        } else {
            const secretString = params.username + params.timestamp + process.env.SECRET_KEY_FOR_VOTE_HOTMC;

            selfSign = crypto.createHash('sha1').update(secretString).digest("hex");
        }

        return params.signature !== selfSign;
    }

    private getPrize(): string {
        if (Math.random() < Number(process.env.CHANCE_TOOLS)) {
            return 'tools';
        }

        if (Math.random() < Number(process.env.CHANCE_MONEY)) {
            return 'money';
        }

        return '';
    }
}
