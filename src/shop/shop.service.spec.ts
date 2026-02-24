import { ShopService } from './shop.service';
import { PrismaService } from '../prisma/prisma.service';
import { DataProviderService } from '../data-provider/data-provider.service';

describe('ShopService', () => {
  const item = {
    id: 7,
    name: 'Тестовая кирка',
    type: 'tool',
    amount: 125,
    enchantments: {
      'minecraft:efficiency': 5,
      'minecraft:unbreaking': 3,
    },
    gameId: 'minecraft:diamond_pickaxe',
    gameLegend: 'Награда из магазина\n\nДля шахты',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
  };

  let service: ShopService;
  let prismaService: {
    shopItems: { findFirst: jest.Mock };
    shopItemPurchases: { findFirst: jest.Mock };
    users: { findUnique: jest.Mock; updateMany: jest.Mock };
    logs: { create: jest.Mock };
    $transaction: jest.Mock;
  };
  let dataProviderService: { sendToServerApiNew: jest.Mock };

  beforeEach(() => {
    prismaService = {
      shopItems: {
        findFirst: jest.fn(),
      },
      shopItemPurchases: {
        findFirst: jest.fn(),
      },
      users: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      logs: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    dataProviderService = {
      sendToServerApiNew: jest.fn(),
    };

    service = new ShopService(
      prismaService as unknown as PrismaService,
      dataProviderService as unknown as DataProviderService,
    );
  });

  it('delivers purchased item via gmgame-api-new on successful buy', async () => {
    prismaService.shopItems.findFirst.mockResolvedValue(item);
    prismaService.users.findUnique.mockResolvedValue({ username: 'Alex' });

    const txBuy = {
      shopItemPurchases: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 101,
          nextAvailableAt: new Date('2027-01-01T00:00:00.000Z'),
        }),
      },
      users: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ balance: 875 }),
      },
      logs: {
        create: jest.fn().mockResolvedValue(undefined),
      },
    };

    prismaService.$transaction.mockImplementationOnce(async (callback: any) => callback(txBuy));
    dataProviderService.sendToServerApiNew.mockResolvedValue({
      data: {
        success: true,
        command:
          'minecraft:give Alex minecraft:diamond_pickaxe[enchantments={"minecraft:efficiency":5},lore=[{"text":"Награда из магазина","italic":false}]] 1',
        error: null,
      },
    });

    const result = await service.buyItem('discord-user-1', 7);

    expect(result.error).toBeUndefined();
    expect(result.message).toBe('Покупка успешно выполнена');
    expect(dataProviderService.sendToServerApiNew).toHaveBeenCalledWith(
      {
        username: 'Alex',
        itemId: 'minecraft:diamond_pickaxe',
        count: 1,
        enchantments: {
          'minecraft:efficiency': 5,
          'minecraft:unbreaking': 3,
        },
        loreLines: ['Награда из магазина', 'Для шахты'],
        purchaseId: 101,
      },
      'shop_grant_item_new',
      'POST',
    );
  });

  it('compensates balance when grant in gmgame-api-new fails', async () => {
    prismaService.shopItems.findFirst.mockResolvedValue(item);
    prismaService.users.findUnique.mockResolvedValue({ username: 'Alex' });

    const txBuy = {
      shopItemPurchases: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 303,
          nextAvailableAt: new Date('2027-01-01T00:00:00.000Z'),
        }),
      },
      users: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({ balance: 875 }),
      },
      logs: {
        create: jest.fn().mockResolvedValue(undefined),
      },
    };

    const txCompensation = {
      users: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      shopItemPurchases: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      logs: {
        create: jest.fn().mockResolvedValue(undefined),
      },
    };

    prismaService.$transaction
      .mockImplementationOnce(async (callback: any) => callback(txBuy))
      .mockImplementationOnce(async (callback: any) => callback(txCompensation));

    dataProviderService.sendToServerApiNew.mockResolvedValue({
      data: {
        success: false,
        error: 'rcon unavailable',
      },
    });

    const result = await service.buyItem('discord-user-2', 7);

    expect(result).toEqual({
      error: 'Покупка отменена: не удалось выдать предмет в игре. Баланс восстановлен.',
    });
    expect(txCompensation.users.updateMany).toHaveBeenCalledWith({
      where: {
        user_id: 'discord-user-2',
      },
      data: {
        balance: {
          increment: 125,
        },
      },
    });
    expect(txCompensation.shopItemPurchases.updateMany).toHaveBeenCalledWith({
      where: {
        id: 303,
        userId: 'discord-user-2',
        deletedAt: null,
      },
      data: {
        deletedAt: expect.any(Date),
      },
    });
  });
});
