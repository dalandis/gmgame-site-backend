import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from './users.model';
import { DataProviderService } from '../data-provider/data-provider.service';
import { UtilsService } from '../Utils/utils.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { OldUser } from './old-user.model';
import { IsNull } from 'sequelize-typescript';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(OldUser)
    private oldUserModel: typeof OldUser,
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
      attributes: { exclude: ['password'] },
    });
  }

  async addUser(params, discordUser): Promise<Record<string, string>> {
    const user = await this.userModel.findOne({
      where: {
        [Op.or]: [{ user_id: discordUser.id }, { username: params.login }],
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
      is_discord: discordResponse?.data?.data || false,
      server: params.servers,
      friends: params.friend_name,
      citizenship: false,
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

    const job = await this.usersQueue.getJob(
      `${discordUser.id}-create-new-user-ticket`,
    );

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

  async changePassword(params, user) {
    const payload = {
      password: params.password,
      username: user.localuser.username,
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
    const user = await this.userModel.findOne({
      where: {
        [Op.and]: [
          { user_id: reqUser.id },
          { status: 3 },
          { reapplication: false },
        ],
      },
    });

    if (!user) {
      return { error: 'Пользователь не определен или отклонил повторную заявку' };
    }

    await this.oldUserModel.create({
      username: user.username,
      password: user.password,
      tag: user.tag,
      type: user.type,
      age: user.age,
      from_about: user.from_about,
      you_about: user.you_about,
      status: user.status,
      user_id: user.user_id,
      partner: user.partner,
      reg_date: user.reg_date,
      expiration_date: user.expiration_date,
      is_discord: user.is_discord,
      server: user.server,
      friends: user.friends,
      reapplication: true,
      citizenship: user.citizenship,
      balance: user.balance,
      immun: user.immun,
      note: user.note,
    });

    const job = await this.usersQueue.getJob(
      `${reqUser.id}-create-new-user-ticket`,
    );

    if (job) {
      await job.remove();
    }

    await this.userModel.upsert({
      user_id: user.user_id,
      status: 6,
      tag: '{}',
      age: 0,
      from_about: '',
      you_about: '',
      is_discord: user.is_discord,
      type: 0,
      username: null,
      reapplication: true,
      citizenship: user.citizenship,
    });

    return { message: 'Обновлена информация о повторной отправке' };
  }
}
