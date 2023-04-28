import { Injectable } from '@nestjs/common';
import { createUserDto, checkUserDto, decisionUserDto, eventUserDto } from '../validator/external-api/create-user';
import { ConfigModule } from '@nestjs/config';
import {UsersService} from '../users/users.service';
import { User } from '../users/users.model';
import { Awards } from '../awards/awards.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op, col } from 'sequelize';
import { UtilsService } from '../Utils/utils.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import * as crypto from 'crypto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { LogsService } from '../logs/logs.service';
import { Territories } from '../territories/territories.model';

ConfigModule.forRoot({
    envFilePath: '.env.api'
});

interface ISignData{
    project?: string,
    timestamp: string,
    username: string,
    signature: string
}

interface Location {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

interface Terr {
    territory: string;
    guild: string;
    acquired: string;
    attacker: null | string;
    location: Location;
    username: string;
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
        private readonly dataProviderService: DataProviderService,
        @InjectQueue('users') 
        private usersQueue: Queue,
        private readonly logsService: LogsService,
        @InjectModel(Territories)
        private territoriesModel: typeof Territories,
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
        const job = await this.usersQueue.getJob(`${params.user}-accept`);

        if (job && job.data.action === 'accept-user') {
            return { "error": 'task in work', "status_code": 400, "status": null }
        }

        const user = await this.userModel.findOne({
            where: {
                user_id: params.user
            },
            attributes: ['username', 'password', 'type']
        });

        this.usersQueue.add(
            {
                action: 'accept-user',
                id: params.user,
                username: user.username,
                manager: 'gmgame bot',
                managerName: 'gmgame bot'
            },
            {
                jobId: `${params.user}-accept`,
                removeOnComplete: true
            }
        );

        return {"success": "ok", "status_code": 200, "error": "", "data": "" };

        // try{
        //     const user = await this.userModel.findOne({
        //         where: {
        //             user_id: params.user
        //         },
        //         attributes: ['username', 'password', 'type']
        //     });

        //     const isDiscord = await this.dataProviderService.sendToBot({user: params.user}, 'check_user_define', 'POST');

        //     const days = isDiscord.data ? 60 : 14;
        //     const date = new Date();
        //     date.setDate(date.getDate() + days);

        //     this.userModel.update(
        //         {
        //             expiration_date: date,
        //             is_discord: isDiscord.data
        //         },
        //         {
        //             where: {
        //                 user_id: params.user
        //             }
        //         }
        //     );

        //     const payload = {
        //         "username" : user.username,
        //         "password" : user.password,
        //         "type" : user.type
        //     }

        //     const response = await this.dataProviderService.sendToServerApi(payload, 'add_user_new', 'POST');

        //     if (response.status != 200) {
        //         return { "error": `error add user, ${response.status}`, "status_code": 400, "status": null }
        //     }

        //     await this.userModel.update(
        //         {
        //             status: 2
        //         },
        //         {
        //             where: {
        //                 user_id: params.user
        //             }
        //         }
        //     );

        //     return {"success": "ok", "status_code": 200, "error": "", "data": "" };
        // } catch (err) {
        //     return { "error": "unknown error", "status_code": 400, "status": null };
        // }
    }

    async eventUser(params: eventUserDto): Promise<Record<string,string|number>> {
        const user = await this.userModel.findOne({
            where: {
                user_id: params.user_id
            },
        });

        await this.logsService.logger(
            JSON.stringify({action: `${params.event}-discord`}),
            `${params.event}-discord`,
            params.user_id,
            'bot',
            'bot'
        ).catch(err => console.log(err));

        if (!user?.user_id && params.event === 'join') {
            this.userModel.create({
                user_id: params.user_id,
                status: 6,
                tag: '{}',
                age: 0,
                from_about: '',
                you_about: '',
                is_discord: true,
                type: 0
            });

            return {};
        }

        if (!user?.username) {
            return {};
        }

        let toUpadate: {is_discord?: boolean, expiration_date?: Date} = {};

        if (params.event === 'join') {
            if (user.is_discord) {
                return {};
            }

            toUpadate = {is_discord: true};

            const expirationDate = user.expiration_date ? new Date(user.expiration_date) : new Date(user.createdAt);
            expirationDate.setDate(expirationDate.getDate() + 46);

            if (!user.expiration_date && expirationDate > user.expiration_date) {
                toUpadate = {...toUpadate, ...{expiration_date: expirationDate}};
            }
        }

        if (params.event === 'leave') {
            if (!user.is_discord) {
                return {};
            }

            toUpadate = {is_discord: false};

            const expirationDate = new Date();

            if (!user.expiration_date && expirationDate < user.expiration_date) {
                toUpadate = {...toUpadate, ...{expiration_date: expirationDate}};
            }
        }
        console.log(toUpadate)
        if (toUpadate.expiration_date) {
            this.logsService.logger(
                `Change expiration date for reason ${params.event} with ${user.expiration_date || user.createdAt} to ${toUpadate.expiration_date}`, 
                'change-expiration-date', user.user_id, 'bot', 'bot'
            ).catch(err => console.log(err));
        }

        this.userModel.update(
            toUpadate,
            {
                where: {
                    user_id: params.user_id
                }
            }
        ).catch(err => console.log(err));

        return {};
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

    async getLocations(world): Promise<{success?: string, status_code: number, error: string, territories?: {[key: string]: Terr }, status?: boolean, world?: string}> {
        try{
            const locations = await this.territoriesModel.findAll({
                include: [{
                    model: this.userModel,
                    attributes: []
                }],
                where: {
                    world: world
                },
                attributes: [
                    'name',
                    'xStart',
                    'zStart',
                    'xStop',
                    'zStop',
                    [col('player.username'), 'username']
                ],
                raw: true
            });

            let terrs: { [key: string]: Terr } = {};

            for (let marker of locations) {
                terrs[marker.name] = {
                    territory: `'${marker.name}'`,
                    username: marker.username,
                    guild: "",
                    acquired: "2021-05-05 02:24:09",
                    attacker: null,
                    location: {
                        startX: marker.xStart,
                        startY: marker.zStart,
                        endX: marker.xStop,
                        endY: marker.zStop
                    }
                };
            }

            return {"success": "ok", "status_code": 200, "error": "", "territories": terrs, "world": world };
        } catch (err) {
            return { "error": "unknown error", "status_code": 400, "status": null };
        }
    }
}
