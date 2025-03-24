import { Injectable } from '@nestjs/common';
import {
  createUserDto,
  checkUserDto,
  decisionUserDto,
  eventUserDto,
} from '../validator/external-api/create-user';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UtilsService } from '../Utils/utils.service';
import { DataProviderService } from '../data-provider/data-provider.service';
import * as crypto from 'crypto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { LogsService } from '../logs/logs.service';
import { PrismaService } from '../prisma/prisma.service';

ConfigModule.forRoot({
  envFilePath: '.env.api',
});

interface ISignData {
  project?: string;
  timestamp: string;
  username: string;
  signature: string;
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
    private readonly utilsService: UtilsService,
    private readonly dataProviderService: DataProviderService,
    @InjectQueue('users')
    private usersQueue: Queue,
    private readonly logsService: LogsService,
    private readonly prismaService: PrismaService,
  ) {}

  async createUser(
    params: createUserDto,
    username: string,
  ): Promise<Record<string, string | number>> {
    try {
      params.partner ||= username;

      const result = await this.userService.addUser(params, params.user_json);

      if (result.error) {
        return { error: result.error, status_code: 400, success: '' };
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

      return {
        success: 'registration successful',
        status_code: 200,
        error: '',
      };
    } catch (err) {
      return { error: 'unknown error', status_code: 400, success: '' };
    }
  }

  async getStatus(userId: string): Promise<Record<string, string | number>> {
    try {
      const user = await this.prismaService.users.findUnique({
        where: {
          user_id: userId,
        },
        select: {
          status: true,
        },
      });

      return { error: '', status_code: 200, status: user.status };
    } catch (err) {
      return { error: 'unknown error', status_code: 400, status: null };
    }
  }

  async checkUser(
    params: checkUserDto,
  ): Promise<Record<string, string | number | Record<string, string>>> {
    try {
      const user = await this.prismaService.users.findFirst({
        where: {
          OR: [{ user_id: params.user }, { username: params.user }],
        },
        select: {
          username: true,
          status: true,
          tag: true,
          type: true,
          user_id: true,
        },
      });

      const tag = user.tag as any;

      return {
        success: 'ok',
        status_code: 200,
        error: '',
        data: {
          username: user.username,
          status: await this.utilsService.getStatus(user.status),
          tag: !!+tag.discriminator ? tag.username + '#' + tag.discriminator : tag.global_name,
          type: user.type ? 'Лицензия' : 'Пиратка',
          discord_id: user.user_id,
        },
      };
    } catch (err) {
      console.log(err);
      return { error: 'unknown error', status_code: 400, status: null };
    }
  }

  async acceptUser(params: decisionUserDto): Promise<Record<string, string | number>> {
    const job = await this.usersQueue.getJob(`${params.user}-accept`);

    if (job && job.data.action === 'accept-user') {
      return { error: 'task in work', status_code: 400, status: null };
    }

    const user = await this.prismaService.users.findFirst({
      where: {
        user_id: params.user,
      },
      select: {
        username: true,
        password: true,
        type: true,
      },
    });

    const now = new Date().getTime();
    const nowHours = new Date(now).getHours();
    let delay = 0;

    if (nowHours >= 22 || nowHours < 8) {
      const executionDate = new Date(now);

      executionDate.setHours(8, 0, 0, 0);

      if (nowHours >= 22) {
        executionDate.setDate(executionDate.getDate() + 1);
      }

      delay = executionDate.getTime() - now;
    }

    this.usersQueue.add(
      {
        action: 'accept-user',
        id: params.user,
        username: user.username,
        manager: 'gmgame bot',
        managerName: 'gmgame bot',
      },
      {
        jobId: `${params.user}-accept`,
        removeOnComplete: true,
        delay: delay,
      },
    );

    return { success: 'ok', status_code: 200, error: '', data: '' };
  }

  async eventUser(params: eventUserDto): Promise<Record<string, string | number>> {
    const user = await this.prismaService.users.findFirst({
      where: {
        user_id: params.user_id,
      },
      omit: { password: true },
    });

    await this.logsService
      .logger(
        JSON.stringify({ action: `${params.event}-discord` }),
        `${params.event}-discord`,
        params.user_id,
        'bot',
        'bot',
      )
      .catch((err) => console.log(err));

    if (!user?.user_id && params.event === 'join') {
      await this.prismaService.users.create({
        data: {
          user_id: params.user_id,
          status: 6,
          tag: '{}',
          age: 0,
          from_about: '',
          you_about: '',
          is_discord: true,
          type: 0,
        },
      });

      return { satus: 6 };
    }

    if (!user?.username) {
      return { status: 6 };
    }

    let toUpadate: { is_discord?: boolean; expiration_date?: Date } = {};

    if (params.event === 'join') {
      if (user.is_discord) {
        return { status: user.status };
      }

      toUpadate = { is_discord: true };

      const expirationDate = user.expiration_date
        ? new Date(user.expiration_date)
        : new Date(user.createdAt);
      expirationDate.setDate(expirationDate.getDate() + 53);

      if (!user.expiration_date && expirationDate > user.expiration_date) {
        toUpadate = { ...toUpadate, ...{ expiration_date: expirationDate } };
      }
    }

    if (params.event === 'leave') {
      if (!user.is_discord) {
        return {};
      }

      toUpadate = { is_discord: false };

      const expirationDate = new Date();

      if (!user.expiration_date && expirationDate < user.expiration_date) {
        toUpadate = { ...toUpadate, ...{ expiration_date: expirationDate } };
      }
    }

    if (toUpadate.expiration_date) {
      this.logsService
        .logger(
          `Change expiration date for reason ${params.event} with ${
            user.expiration_date || user.createdAt
          } to ${toUpadate.expiration_date}`,
          'change-expiration-date',
          user.user_id,
          'bot',
          'bot',
        )
        .catch((err) => console.log(err));
    }

    this.prismaService.users.update({
      where: {
        user_id: params.user_id,
      },
      data: toUpadate,
    });

    return { status: user.status };
  }

  async denyUser(params: decisionUserDto): Promise<Record<string, string | number>> {
    try {
      await this.prismaService.users.update({
        where: {
          user_id: params.user,
        },
        data: {
          status: 3,
        },
      });

      return { success: 'ok', status_code: 200, error: '', data: '' };
    } catch (err) {
      return { error: 'unknown error', status_code: 400, status: null };
    }
  }

  async voteHandler(params): Promise<Record<string, string | number>> {
    try {
      const username = params.username || params.nick;

      const signData: ISignData = {
        project: params.project,
        timestamp: params.timestamp || params.time,
        username: username,
        signature: params.signature || params.sign,
      };

      if (this.checkSign(signData)) {
        return {
          error: 'Переданные данные не прошли проверку',
          status_code: 400,
          status: null,
        };
      }

      const prize: string = this.getPrize();

      const dataToBot = {
        username: username,
        prize: prize,
      };

      this.dataProviderService.sendToBot(dataToBot, 'send_embed', 'POST');

      if (!prize) {
        return { success: 'ok', status_code: 200, error: '', data: '' };
      }

      const user = await this.prismaService.users.findFirst({
        where: {
          username: username,
        },
        select: {
          user_id: true,
          balance: true,
        },
      });

      if (!user?.user_id) {
        return { success: 'ok', status_code: 200, error: '', data: '' };
      }

      if (prize === 'money') {
        await this.prismaService.users.update({
          where: {
            username: username,
          },
          data: {
            balance: user.balance + 10,
          },
        });
      } else {
        await this.prismaService.awards.create({
          data: {
            user_id: user.user_id,
            type: prize,
          },
        });
      }

      return { success: 'ok', status_code: 200, error: '', data: '' };
    } catch (err) {
      return { error: 'unknown error', status_code: 400, status: null };
    }
  }

  private checkSign(params: ISignData): boolean {
    let selfSign: string;

    if (params.project) {
      const secretString = [
        params.project,
        process.env.SECRET_KEY_FOR_VOTE_MINESERV,
        params.timestamp,
        params.username,
      ].join('.');

      selfSign = crypto.createHash('sha256').update(secretString).digest('hex');
    } else {
      const secretString =
        params.username + params.timestamp + process.env.SECRET_KEY_FOR_VOTE_HOTMC;

      selfSign = crypto.createHash('sha1').update(secretString).digest('hex');
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

  async getLocations(
    world,
    status,
  ): Promise<{
    success?: string;
    status_code: number;
    error: string;
    territories?: { [key: string]: Terr };
    status?: boolean;
    world?: string;
  }> {
    try {
      const locations = await this.prismaService.territories.findMany({
        where: {
          world: world,
          status: status,
        },
        select: {
          name: true,
          xStart: true,
          zStart: true,
          xStop: true,
          zStop: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      let terrs: { [key: string]: Terr } = {};

      for (let marker of locations) {
        terrs[marker.name] = {
          territory: `'${marker.name}'`,
          username: marker.user.username,
          guild: '',
          acquired: '2021-05-05 02:24:09',
          attacker: null,
          location: {
            startX: marker.xStart,
            startY: marker.zStart,
            endX: marker.xStop,
            endY: marker.zStop,
          },
        };
      }

      return {
        success: 'ok',
        status_code: 200,
        error: '',
        territories: terrs,
        world: world,
        status: status,
      };
    } catch (err) {
      return { error: 'unknown error', status_code: 400, status: null };
    }
  }

  async kickUser(params): Promise<Record<string, string | number | Record<string, string>>> {
    try {
      const user = await this.prismaService.users.findFirst({
        where: {
          user_id: params.user,
        },
        select: {
          username: true,
        },
      });

      if (!user) {
        return { error: 'user not found', status_code: 400, status: null };
      }

      const response = await this.dataProviderService.sendToServerApi(
        { user: user.username },
        'kick_user_new',
        'POST',
      );

      if (response.status != 200) {
        return {
          error: `error kick user, ${response.status}`,
          status_code: 400,
          status: null,
        };
      }

      return {
        success: 'ok',
        status_code: 200,
        error: '',
        data: {
          username: user.username,
        },
      };
    } catch (err) {
      console.log(err);
      return { error: 'unknown error', status_code: 400, status: null };
    }
  }

  async lightningStrike(): Promise<Record<string, string | number>> {
    try {
      const response = await this.dataProviderService.sendToServerApiNew(
        {},
        'lightning_strike',
        'GET',
      );

      if (response.status != 200) {
        return {
          error: `error lightning strike, ${response.status}`,
          status_code: 400,
          status: null,
        };
      }

      return { success: 'ok', status_code: 200, error: '', data: '' };
    } catch (err) {
      return { error: 'unknown error', status_code: 400, status: null };
    }
  }
}
