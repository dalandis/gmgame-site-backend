import { Injectable } from '@nestjs/common';
import { shopItems } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  shopItemCreateDto,
  shopItemDeleteDto,
  shopItemUpdateDto,
} from '../../validator/admin/shop-items-admin';

@Injectable()
export class ShopItemsAdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async getItems(): Promise<shopItems[]> {
    return this.prismaService.shopItems.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async createItem(
    body: shopItemCreateDto,
  ): Promise<{ error?: string; message?: string; item?: shopItems }> {
    const item = await this.prismaService.shopItems.create({
      data: {
        name: body.name,
        type: body.type,
        amount: body.amount,
        enchantments: body.enchantments,
        gameId: body.gameId,
        gameLegend: body.gameLegend,
      },
    });

    return { message: 'Товар создан', item };
  }

  async updateItem(
    body: shopItemUpdateDto,
  ): Promise<{ error?: string; message?: string; item?: shopItems }> {
    const item = await this.prismaService.shopItems.findFirst({
      where: {
        id: body.id,
        deletedAt: null,
      },
    });

    if (!item) {
      return { error: 'Товар не найден' };
    }

    const updatedItem = await this.prismaService.shopItems.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
        type: body.type,
        amount: body.amount,
        enchantments: body.enchantments,
        gameId: body.gameId,
        gameLegend: body.gameLegend,
      },
    });

    return { message: 'Товар обновлён', item: updatedItem };
  }

  async deleteItem(body: shopItemDeleteDto): Promise<{ error?: string; message?: string }> {
    const item = await this.prismaService.shopItems.findFirst({
      where: {
        id: body.id,
        deletedAt: null,
      },
    });

    if (!item) {
      return { error: 'Товар не найден' };
    }

    await this.prismaService.shopItems.update({
      where: {
        id: body.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Товар удалён' };
  }
}
