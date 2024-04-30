import { Injectable } from '@nestjs/common';
import { territoriesDto } from 'src/validator/save_edit.territories';
import { territories } from '@prisma/client';
import { UtilsService } from '../Utils/utils.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TerritoriesService {
  constructor(private readonly utilsService: UtilsService, private prismaService: PrismaService) {}

  async getTerritories(user_id: string): Promise<territories[]> {
    return this.prismaService.territories.findMany({
      where: {
        user_id,
      },
    });
  }

  async getTerr(user_id: string, id: number): Promise<territories> {
    console.log(id);
    if (!id) {
      return null;
    }
    return this.prismaService.territories.findUnique({
      where: {
        id: id,
        user_id,
      },
    });
  }

  async editTerritories(params: territoriesDto, user: string): Promise<Record<string, string>> {
    try {
      await this.prismaService.territories.update({
        where: {
          id: params.terrID,
          user_id: user,
        },
        data: {
          world: params.server,
          name: params.name,
          xStart: params.startX,
          xStop: params.stopX,
          zStart: params.startZ,
          zStop: params.stopZ,
        },
      });
      const responce = this.utilsService.getWorldName(params.server);
      return { message: 'Территория обновлена', ...responce };
    } catch (err) {
      return { error: `Ошибка при обновлении территории: ${err}` };
    }
  }

  async addTerritories(params: territoriesDto, user: string): Promise<Record<string, string>> {
    try {
      await this.prismaService.territories.create({
        data: {
          world: params.server,
          name: params.name,
          xStart: params.startX,
          xStop: params.stopX,
          zStart: params.startZ,
          zStop: params.stopZ,
          user_id: user,
          status: 'active',
        },
      });
      const responce = this.utilsService.getWorldName(params.server);
      return { message: 'Территория добавлена', ...responce };
    } catch (err) {
      return { error: `Ошибка при добавлении территории: ${err}` };
    }
  }

  async deleteTerritories(params: territoriesDto, user: string): Promise<Record<string, string>> {
    try {
      await this.prismaService.territories.delete({
        where: {
          id: params.terrID,
          user_id: user,
        },
      });

      return { message: 'Территория удалена' };
    } catch (err) {
      return { error: `Ошибка при удалении территории: ${err}` };
    }
  }
}
