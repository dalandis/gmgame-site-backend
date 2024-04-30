import { Injectable } from '@nestjs/common';

export interface IWorldType {
  worldName: string;
  layer: string;
}

@Injectable()
export class UtilsService {
  public getWorldName(world: string): IWorldType {
    switch (world) {
      case 'gmgame':
        // return {worldName: 'GMGameWorld - overworld', layer: 'over'};
        return { worldName: 'GMGameWorld', layer: 'over' };
      case 'farm':
        // return {worldName: 'FarmWorld - overworld', layer: 'over'};
        return { worldName: 'FarmWorld', layer: 'over' };
      case 'nether-farm':
        // return {worldName: 'FarmWorld-Nether - nether', layer: 'nether'};
        return { worldName: 'FarmWorld-Nether', layer: 'nether' };
      case 'end-farm':
        // return {worldName: 'FarmWorld-End - end', layer: 'the_end'};
        return { worldName: 'FarmWorld-End', layer: 'the_end' };
      default:
        // return {worldName: 'GMGameWorld - overworld', layer: 'over'};
        return { worldName: 'GMGameWorld', layer: 'over' };
    }
  }

  public async getStatus(status: number): Promise<string> {
    switch (status) {
      case 1:
        return 'Заявка на рассмотрении';
      case 2:
        return 'Игрок сервера';
      case 3:
        return 'Отказ по заявке';
      case 4:
        return 'Бан на сервере';
      case 5:
        return 'Не активный игрок';
      case 6:
        return 'Новый пустой пользователь';
      case 7:
        return 'Старый отклоненный пользователь';
      default:
        return 'Новая заявка';
    }
  }

  public getAccountType(type: number): string {
    if (type == 1) {
      return 'Лицензия';
    }

    return 'Пиратка';
  }

  public getDiscord(discordUser): string {
    if (discordUser.discriminator) {
      return `${discordUser.username}#${discordUser.discriminator}`;
    }

    return discordUser.id;
  }

  public getWorldType(type: string): IWorldType {
    if (type == 'basePlayers' || type == 'city' || type == 'shopping_centers') {
      // return {worldName: 'GMGameWorld - overworld', layer: 'over'};
      return { worldName: 'GMGameWorld', layer: 'over' };
    }

    if (
      type == 'turquoise' ||
      type == 'orange' ||
      type == 'lime' ||
      type == 'pink' ||
      type == 'farm'
    ) {
      // return {worldName: 'GMGameWorld-Nether - nether', layer: 'nether'};
      return { worldName: 'GMGameWorld-Nether', layer: 'nether' };
    }

    if (type == 'end_portals' || type == 'pixel_arts') {
      // return {worldName: 'GMGameWorld-TheEnd - end', layer: 'the_end'};
      return { worldName: 'GMGameWorld-TheEnd', layer: 'the_end' };
    }
  }
}
