import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { users } from '@prisma/client';
import { DataProviderService } from '../data-provider/data-provider.service';
import { UtilsService } from '../Utils/utils.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../validator/create.user';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataProviderService: DataProviderService,
    private readonly utilsService: UtilsService,
    @InjectQueue('users')
    private usersQueue: Queue,
    private prismaService: PrismaService,
  ) {}

  async getUser(user_id: string): Promise<Omit<users, 'password'>> {
    const user = await this.prismaService.users.findUnique({
      where: {
        user_id,
      },
      omit: { password: true },
    });

    return user;
  }

  async addUser(params: CreateUserDto, discordUser): Promise<Record<string, string>> {
    const user = await this.prismaService.users.findFirst({
      where: {
        OR: [
          { user_id: discordUser.id },
          { username: { equals: params.login, mode: 'insensitive' } },
        ],
      },
    });

    if (user && user.username) {
      return { error: 'Пользователь существует' };
    }

    let discordResponse = null;

    try {
      discordResponse = await this.dataProviderService.sendToBot(
        { user: discordUser.id },
        'check_user_define',
        'POST',
      );
    } catch (error) {
      console.log(error);
      return { error: 'Ошибка Discord' };
    }

    const data = {
      username: params.login,
      password: params.password,
      tag: discordUser,
      type: params.type,
      age: params.age,
      from_about: params.from_about,
      you_about: params.you_about,
      status: 1,
      user_id: discordUser.id,
      partner: 'gmgame',
      is_discord: discordResponse?.data?.data || false,
      server: params.servers,
      friends: params.friend_name,
    };

    await this.prismaService.users.upsert({
      where: {
        user_id: discordUser.id,
      },
      update: data,
      create: data,
    });

    this.sendWebhook(params, discordUser, user?.reapplication);

    return { message: 'Пользователь успешно создан' };
  }

  private async sendWebhook(params, discordUser, reapplication = false) {
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
      reapplication: reapplication,
    };

    const job = await this.usersQueue.getJob(`${discordUser.id}-create-new-user-ticket`);

    if (job && job.data.action === `create-new-user-ticket`) {
      return { error: true, message: 'Уже есть такая заявка' };
    }

    this.usersQueue.add(
      {
        action: `create-new-user-ticket`,
        id: discordUser.id,
        username: params.login,
        manager: discordUser.id,
        managerName: params.login,
        payload: payload,
        noLog: true,
      },
      {
        jobId: `${discordUser.id}-create-new-user-ticket`,
        removeOnComplete: false,
      },
    );

    // this.dataProviderService.sendToBot({ticket: data, name: params.login}, 'new_ticket', 'POST');
    // this.dataProviderService.sendToBot(payload, 'create_ticket', 'POST');
  }

  async changePassword(params, user_id) {
    const user = await this.prismaService.users.findFirst({
      where: {
        user_id: user_id,
      },
      select: {
        username: true,
      },
    });

    const payload = {
      password: params.password,
      username: user.username,
    };

    const result = await this.dataProviderService.sendToServerApi(
      payload,
      '/change_password_new',
      'POST',
    );

    if (result.status != 200) {
      return { error: `Ошибка изменения пароля: ${result.status}` };
    }

    return { message: 'Пароль изменен' };
  }

  async resubmit(reqUser) {
    const user = await this.prismaService.users.findFirst({
      where: {
        AND: [{ user_id: reqUser.id }, { status: 3 }, { reapplication: false }],
      },
    });

    if (!user) {
      return { error: 'Пользователь не определен или отклонил повторную заявку' };
    }

    const oldUser = { ...user } as any;
    delete oldUser.id;
    delete oldUser.user_id;

    await this.prismaService.oldUsers.create({
      data: {
        user: {
          connect: { user_id: user.user_id },
        },
        ...oldUser,
      },
    });

    const job = await this.usersQueue.getJob(`${reqUser.id}-create-new-user-ticket`);

    if (job) {
      await job.remove();
    }

    await this.prismaService.users.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        status: 6,
        username: null,
        reapplication: true,
      },
    });

    return { message: 'Обновлена информация о повторной отправке' };
  }
}
