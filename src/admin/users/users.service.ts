import { Injectable } from '@nestjs/common';
import {
  actionUserDto,
  getUserDto,
  markersUpdateDto,
  regenActionDto,
  terrUpdateDto,
  updateUserDto,
} from '../../validator/admin/users-admin';
import { User } from '../../users/users.model';
import { Markers } from '../../markers/markers.model';
import { Territories } from '../../territories/territories.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col } from 'sequelize';
import { Queue } from 'bull';
import * as Minio from 'minio';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { ConfigModule } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { LogsService } from '../../logs/logs.service';
import { Regens } from './regens.model';
import { Tickets } from '../../tickets/tickets.model';
import { OldUser } from '../../users/old-user.model';

ConfigModule.forRoot({
  envFilePath: '.env.minio',
});

@Injectable()
export class UserAdminService {
  private readonly redis: Redis;

  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Markers)
    private markersModel: typeof Markers,
    @InjectModel(Territories)
    private territoriesModel: typeof Territories,
    @InjectQueue('users')
    private usersQueue: Queue,
    private logsService: LogsService,
    @InjectModel(Regens)
    private regensModel: typeof Regens,
    @InjectQueue('markers')
    private markersQueue: Queue,
    @InjectModel(Tickets)
    private ticketsModel: typeof Tickets,
    @InjectModel(OldUser)
    private oldUserModel: typeof OldUser,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();
  }

  async getUser(params: getUserDto): Promise<User[]> {
    const user = await this.userModel.findAll({
      include: [
        { model: this.markersModel },
        { model: this.territoriesModel },
        { model: this.ticketsModel },
        { model: this.oldUserModel, attributes: { exclude: ['password'] } },
      ],
      where: {
        [Op.or]: [
          { user_id: params.searchParam },
          { username: { [Op.like]: `%${params.searchParam}%` } },
        ],
      },
      attributes: [
        'username',
        'status',
        'tag',
        'type',
        'user_id',
        'age',
        'from_about',
        'you_about',
        'partner',
        'immun',
        'note',
        'expiration_date',
        'citizenship',
      ],
    });

    console.log(user);

    return user;
  }

  async getMarkers(): Promise<Markers[]> {
    return this.markersModel.findAll({
      include: [
        {
          model: this.userModel,
          attributes: [],
        },
      ],
      attributes: [
        'id',
        'id_type',
        'x',
        'y',
        'z',
        'name',
        'description',
        'user',
        'server',
        'flag',
        [col('player.username'), 'username'],
      ],
    });
  }

  async getTerritories(): Promise<Territories[]> {
    return this.territoriesModel.findAll({
      include: [
        {
          model: this.userModel,
          attributes: [],
        },
      ],
      attributes: [
        'id',
        'xStart',
        'zStart',
        'xStop',
        'zStop',
        'name',
        'user',
        'world',
        [col('player.username'), 'username'],
      ],
    });
  }

  async actionUser(
    params: actionUserDto,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    const user = await this.userModel.findOne({
      where: {
        user_id: params.user,
      },
      attributes: ['username', 'status', 'tag', 'type', 'user_id', 'age'],
    });

    if (!user) {
      return { error: true, message: 'Пользователь не найден' };
    }

    const job = await this.usersQueue.getJob(
      `${user.user_id}-${params.action}`,
    );

    if (job && job.data.action === `${params.action}-user`) {
      return { error: true, message: 'Уже есть такой таск' };
    }

    switch (params.action) {
      case null:
        return { error: true, message: 'Неизвестное действие' };
      case 'decline':
        this.userModel.update(
          {
            status: 3,
          },
          {
            where: {
              user_id: user.user_id,
            },
          },
        );
        return { result: true, message: 'Пользователь отклонен' };
      default:
        this.usersQueue.add(
          {
            action: `${params.action}-user`,
            id: user.user_id,
            username: user.username,
            manager: manager.id,
            managerName: manager.localuser?.username || manager.username,
          },
          {
            jobId: `${user.user_id}-${params.action}`,
            removeOnComplete: true,
          },
        );
        return { result: true, message: 'Задача добавлена в очередь' };
    }
  }

  async deleteMarker(
    id: number,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    const marker = await this.markersModel
      .findOne({
        where: {
          id: id,
        },
        attributes: ['name', 'x', 'y', 'z', 'id_type', 'description', 'user'],
      })
      .then((marker) => {
        this.markersModel.destroy({
          where: {
            id: id,
          },
        });
        return marker;
      });

    this.logsService.logger(
      JSON.stringify({ action: 'delete-marker', data: marker }),
      'delete-marker',
      marker.user,
      manager.localuser.username,
      manager.id,
    );

    const job = await this.markersQueue.getJob(
      `refreshMarkers-${marker.server}-${marker.id_type}`,
    );

    if (
      job &&
      job.data.action !== `refreshMarkers-${marker.server}-${marker.id_type}`
    ) {
      this.markersQueue.add(
        {
          action: `refreshMarkers-${marker.server}`,
          serverName: marker.server,
          type: marker.id_type,
        },
        {
          jobId: `refreshMarkers-${marker.server}-${marker.id_type}`,
          removeOnComplete: true,
          delay: 1000 * 60 * 15,
        },
      );
    }

    return { result: true, message: 'Маркер удален' };
  }

  async getLogs(id): Promise<any> {
    return this.logsService.getLogs(id);
  }

  async updateMarker(
    body: markersUpdateDto,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    const marker = await this.markersModel
      .findOne({
        where: {
          id: body.id,
        },
        attributes: ['name', 'x', 'y', 'z', 'id_type', 'description', 'user'],
      })
      .then((marker) => {
        this.markersModel.update(
          {
            name: body.name,
            x: body.x,
            y: body.y,
            z: body.z,
            id_type: body.id_type,
            description: body.description,
          },
          {
            where: {
              id: body.id,
            },
          },
        );
        return marker;
      });

    this.logsService.logger(
      JSON.stringify({
        action: 'update-marker',
        data: { oldMarker: marker, newMarker: body },
      }),
      'update-marker',
      marker.user,
      manager.localuser.username,
      manager.id,
    );

    const job = await this.markersQueue.getJob(
      `refreshMarkers-${marker.server}-${marker.id_type}`,
    );

    if (
      job &&
      job.data.action !== `refreshMarkers-${marker.server}-${marker.id_type}`
    ) {
      this.markersQueue.add(
        {
          action: `refreshMarkers-${marker.server}-${marker.id_type}`,
          serverName: marker.server,
          type: marker.id_type,
        },
        {
          jobId: `refreshMarkers-${marker.server}-${marker.id_type}`,
          removeOnComplete: true,
          delay: 1000 * 60 * 15,
        },
      );
    }

    return { result: true, message: 'Маркер обновлен' };
  }

  async deleteTerritory(
    id: number,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    const territory = await this.territoriesModel
      .findOne({
        where: {
          id: id,
        },
        attributes: [
          'name',
          'world',
          'xStart',
          'xStop',
          'zStart',
          'zStop',
          'user',
        ],
      })
      .then((territory) => {
        this.territoriesModel.destroy({
          where: {
            id: id,
          },
        });
        return territory;
      });

    this.logsService.logger(
      JSON.stringify({ action: 'delete-territory', data: territory }),
      'delete-territory',
      territory.user,
      manager.localuser.username,
      manager.id,
    );

    return { result: true, message: 'Территория удалена' };
  }

  async updateTerritory(
    body: terrUpdateDto,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    const territory = await this.territoriesModel
      .findOne({
        where: {
          id: body.id,
        },
        attributes: [
          'name',
          'world',
          'xStart',
          'xStop',
          'zStart',
          'zStop',
          'user',
          'status',
        ],
      })
      .then((territory) => {
        let status = territory.status;
        if (body?.name?.includes('[hold]')) {
          status = 'hold';
        }
        if (body?.name?.includes('[repopulate]')) {
          status = 'repopulate';
        }

        this.territoriesModel.update(
          {
            name: body.name,
            world: body.world,
            xStart: body.xStart,
            xStop: body.xStop,
            zStart: body.zStart,
            zStop: body.zStop,
            status: status,
          },
          {
            where: {
              id: body.id,
            },
          },
        );
        return territory;
      });

    this.logsService.logger(
      JSON.stringify({
        action: 'update-territory',
        data: { oldTerritory: territory, newTerritory: body },
      }),
      'update-territory',
      territory.user,
      manager.localuser.username,
      manager.id,
    );

    return { result: true, message: 'Территория обновлена' };
  }

  //getRegens
  async getRegens(): Promise<any> {
    return this.regensModel
      .findAll({
        where: {
          status: 'new',
        },
      })
      .catch((err) => {
        return { error: true, message: err };
      });
  }

  //updateUser
  async updateUser(
    body: updateUserDto,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    const user = await this.userModel
      .findOne({
        where: {
          user_id: body.id,
        },
        attributes: ['expiration_date'],
      })
      .then((user) => {
        this.userModel.update(
          {
            immun: body.immun,
            expiration_date: body.expiration_date,
            note: body.note,
            partner: body.partner,
            citizenship: body.citizenship,
          },
          {
            where: {
              user_id: body.id,
            },
          },
        );
        return user;
      });

    if (body.expiration_date) {
      this.logsService.logger(
        JSON.stringify({
          action: 'change-expiration-date',
          data: {
            expirationDate: user.expiration_date,
            newExpirationDate: body.expiration_date,
          },
        }),
        'update-user',
        body.id,
        manager.localuser.username,
        manager.id,
      );
    }

    return { result: true, message: 'Пользователь обновлен' };
  }

  //regenAction
  async regenAction(
    body: regenActionDto,
    manager,
  ): Promise<{ error?: boolean; result?: boolean; message?: string }> {
    await this.markersModel.destroy({
      where: {
        user: body.user_id,
      },
    });

    if (body.action === 'regen') {
      await this.territoriesModel.destroy({
        where: {
          user: body.user_id,
        },
      });
    } else {
      await this.territoriesModel.update(
        {
          name: fn('replace', col('name'), '[hold]', '[repopulate]'),
          status: 'repopulate',
        },
        {
          where: {
            user: body.user_id,
          },
        },
      );
    }

    await this.regensModel.update(
      {
        status: 'done',
      },
      {
        where: {
          user_id: body.user_id,
        },
      },
    );

    this.logsService.logger(
      JSON.stringify({
        action: 'regen-complet',
        data: { action: body.action },
      }),
      'regen-user',
      body.user_id,
      manager.discordUser?.username || manager.username,
      manager.id,
    );

    return { result: true, message: 'Реген завершен' };
  }

  async getWhitelist(): Promise<any> {
    return this.userModel.findAll({
      where: {
        status: 2,
      },
      attributes: [
        'username',
        'status',
        'tag',
        'type',
        'user_id',
        'age',
        'from_about',
        'you_about',
        'partner',
        'immun',
        'note',
        'expiration_date',
      ],
    });
  }

  async getLink(name: string): Promise<any> {
    let link = await this.redis.get(`gmgame:link:${name}`);

    if (link) {
      return link;
    }

    console.log('getLink');

    const minioClient = new Minio.Client({
      endPoint: process.env.MINIO_END_POINT,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: true,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });

    const expiresLink = 60 * 60 * 24 * 7;

    link = await minioClient.presignedGetObject('tikets', name, expiresLink);

    this.redis.set(`gmgame:link:${name}`, link, 'EX', expiresLink);

    return link;
  }
}
