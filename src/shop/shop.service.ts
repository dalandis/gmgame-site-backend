import { Injectable, Logger } from '@nestjs/common';
import { Prisma, shopItems } from '@prisma/client';
import { AxiosError } from 'axios';
import { DataProviderService } from '../data-provider/data-provider.service';
import { PrismaService } from '../prisma/prisma.service';

const SHOP_COOLDOWN_DAYS = 365;

type ShopItemView = shopItems & {
  canBuy: boolean;
  nextAvailableAt: string | null;
};

type ShopBuyResult = {
  error?: string;
  message?: string;
  newBalance?: number;
  nextAvailableAt?: string;
  purchaseId?: number;
};

type GrantItemResponse = {
  success?: boolean;
  command?: string;
  error?: string | null;
};

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly dataProviderService: DataProviderService,
  ) {}

  async getItems(userId: string): Promise<{ items: ShopItemView[] }> {
    const items = await this.prismaService.shopItems.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (!items.length) {
      return { items: [] };
    }

    const latestPurchases = await this.prismaService.shopItemPurchases.findMany({
      where: {
        userId,
        deletedAt: null,
        shopItemId: {
          in: items.map((item) => item.id),
        },
      },
      orderBy: {
        purchasedAt: 'desc',
      },
      select: {
        shopItemId: true,
        nextAvailableAt: true,
      },
    });

    const now = new Date();
    const latestByItem = new Map<number, Date>();

    for (const purchase of latestPurchases) {
      if (!latestByItem.has(purchase.shopItemId)) {
        latestByItem.set(purchase.shopItemId, purchase.nextAvailableAt);
      }
    }

    const viewItems: ShopItemView[] = items.map((item) => {
      const nextAvailableAtDate = latestByItem.get(item.id);
      const canBuy = !nextAvailableAtDate || nextAvailableAtDate <= now;

      return {
        ...item,
        canBuy,
        nextAvailableAt: canBuy || !nextAvailableAtDate ? null : nextAvailableAtDate.toISOString(),
      };
    });

    return { items: viewItems };
  }

  async buyItem(
    userId: string,
    itemId: number,
  ): Promise<{ error?: string; message?: string; newBalance?: number; nextAvailableAt?: string }> {
    const item = await this.prismaService.shopItems.findFirst({
      where: {
        id: itemId,
        deletedAt: null,
      },
    });

    if (!item) {
      return { error: 'Товар не найден' };
    }

    let result: ShopBuyResult;

    try {
      result = await this.withSerializableRetry(async () =>
        this.prismaService.$transaction(
          async (tx) => {
            const latestPurchase = await tx.shopItemPurchases.findFirst({
              where: {
                userId,
                shopItemId: item.id,
                deletedAt: null,
              },
              orderBy: {
                purchasedAt: 'desc',
              },
              select: {
                nextAvailableAt: true,
              },
            });

            const now = new Date();

            if (latestPurchase?.nextAvailableAt && latestPurchase.nextAvailableAt > now) {
              return {
                error: `Повторная покупка доступна только после ${latestPurchase.nextAvailableAt.toISOString()}`,
                nextAvailableAt: latestPurchase.nextAvailableAt.toISOString(),
              };
            }

            const updatedUser = await tx.users.updateMany({
              where: {
                user_id: userId,
                deletedAt: null,
                balance: {
                  gte: item.amount,
                },
              },
              data: {
                balance: {
                  decrement: item.amount,
                },
              },
            });

            if (!updatedUser.count) {
              return { error: 'Недостаточно средств' };
            }

            const purchasedAt = new Date();
            const nextAvailableAt = this.addDays(purchasedAt, SHOP_COOLDOWN_DAYS);

            const purchase = await tx.shopItemPurchases.create({
              data: {
                userId,
                shopItemId: item.id,
                priceAtPurchase: item.amount,
                purchasedAt,
                nextAvailableAt,
              },
            });

            const user = await tx.users.findUnique({
              where: {
                user_id: userId,
              },
              select: {
                balance: true,
              },
            });

            await tx.logs.create({
              data: {
                log: `Покупка товара "${item.name}" (id=${item.id}) за ${item.amount}`,
                type: 'shop_buy',
                user_id: userId,
                manager: 'system',
                managerId: userId,
                log_date: purchasedAt,
              },
            });

            return {
              message: 'Покупка успешно выполнена',
              newBalance: user?.balance ?? 0,
              nextAvailableAt: purchase.nextAvailableAt.toISOString(),
              purchaseId: purchase.id,
            };
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        ),
      );
    } catch (error) {
      console.error('[SHOP_BUY_ERROR]', error);
      return { error: 'Ошибка при покупке товара' };
    }

    if (!result.error && result.purchaseId) {
      const deliveryResult = await this.deliverPurchasedItem(userId, item, result.purchaseId);

      if (!deliveryResult.success) {
        await this.compensateFailedDelivery(userId, item, result.purchaseId);

        this.logger.error(
          `[SHOP_DELIVERY_FAILED] purchaseId=${result.purchaseId} userId=${userId} itemId=${item.id} gameId=${item.gameId} error=${deliveryResult.error} command=${deliveryResult.command ?? 'n/a'}`,
        );

        return { error: 'Покупка отменена: не удалось выдать предмет в игре. Баланс восстановлен.' };
      }

      this.logger.log(
        `[SHOP_DELIVERY_SUCCESS] purchaseId=${result.purchaseId} userId=${userId} itemId=${item.id} command=${deliveryResult.command ?? 'hidden'}`,
      );
    }

    return {
      error: result.error,
      message: result.message,
      newBalance: result.newBalance,
      nextAvailableAt: result.nextAvailableAt,
    };
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);

    return result;
  }

  private async withSerializableRetry<T>(callback: () => Promise<T>, retries = 3): Promise<T> {
    let attempt = 0;

    while (attempt < retries) {
      try {
        return await callback();
      } catch (error) {
        const isSerializationError =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';

        if (!isSerializationError || attempt >= retries - 1) {
          throw error;
        }
      }

      attempt += 1;
    }

    return callback();
  }

  private async deliverPurchasedItem(
    userId: string,
    item: shopItems,
    purchaseId: number,
  ): Promise<{ success: boolean; command?: string; error?: string }> {
    const user = await this.prismaService.users.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        username: true,
      },
    });

    if (!user?.username) {
      return { success: false, error: 'Не найден Minecraft username для выдачи предмета' };
    }

    const enchantments = this.normalizeEnchantments(item.enchantments);
    const loreLines = this.normalizeLore(item.gameLegend);

    try {
      const response = await this.dataProviderService.sendToServerApiNew(
        {
          username: user.username,
          itemId: item.gameId,
          count: 1,
          enchantments,
          loreLines,
          purchaseId,
        },
        'shop_grant_item_new',
        'POST',
      );

      const data = response.data as GrantItemResponse;

      if (!data?.success) {
        return { success: false, error: data?.error ?? 'Неизвестная ошибка выдачи предмета' };
      }

      return { success: true, command: data.command ?? undefined };
    } catch (error) {
      const axiosError = error as AxiosError<GrantItemResponse>;
      return {
        success: false,
        error:
          axiosError.response?.data?.error ??
          axiosError.message ??
          'Ошибка запроса в игровой API при выдаче предмета',
      };
    }
  }

  private normalizeLore(legend: string): string[] {
    return legend
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  private normalizeEnchantments(enchantments: Prisma.JsonValue): Record<string, number> {
    if (!enchantments || typeof enchantments !== 'object' || Array.isArray(enchantments)) {
      return {};
    }

    const normalized: Record<string, number> = {};

    for (const [key, value] of Object.entries(enchantments as Record<string, unknown>)) {
      if (typeof key !== 'string') {
        continue;
      }

      const level = Number(value);
      if (Number.isInteger(level) && level > 0) {
        normalized[key] = level;
      }
    }

    return normalized;
  }

  private async compensateFailedDelivery(userId: string, item: shopItems, purchaseId: number): Promise<void> {
    try {
      await this.withSerializableRetry(async () =>
        this.prismaService.$transaction(
          async (tx) => {
            await tx.users.updateMany({
              where: {
                user_id: userId,
              },
              data: {
                balance: {
                  increment: item.amount,
                },
              },
            });

            await tx.shopItemPurchases.updateMany({
              where: {
                id: purchaseId,
                userId,
                deletedAt: null,
              },
              data: {
                deletedAt: new Date(),
              },
            });

            await tx.logs.create({
              data: {
                log: `Отмена покупки товара "${item.name}" (purchaseId=${purchaseId}): не удалось выдать предмет в игре`,
                type: 'shop_buy_compensate',
                user_id: userId,
                manager: 'system',
                managerId: userId,
                log_date: new Date(),
              },
            });
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        ),
      );
    } catch (error) {
      this.logger.error(
        `[SHOP_COMPENSATION_FAILED] purchaseId=${purchaseId} userId=${userId} itemId=${item.id}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
