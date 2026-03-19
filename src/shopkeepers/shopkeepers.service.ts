import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

export interface ChestSlot {
  slot: number;
  id: string;
  count: number;
  components?: Record<string, unknown>;
}

export interface ShopkeeperItemComponent {
  'minecraft:custom_name'?: string;
  'minecraft:enchantments'?: string;
  'minecraft:stored_enchantments'?: string;
  'minecraft:repair_cost'?: string;
  'minecraft:container'?: string;
  'minecraft:damage'?: string | number;
  'minecraft:hide_additional_tooltip'?: unknown;
  'minecraft:attribute_modifiers'?: string;
  'minecraft:lore'?: string;
  [key: string]: unknown;
}

export interface ShopkeeperItem {
  DataVersion: number;
  id: string;
  count: number;
  components?: ShopkeeperItemComponent;
}

export interface ShopkeeperOffer {
  resultItem: ShopkeeperItem;
  item1: ShopkeeperItem;
  item2?: ShopkeeperItem;
}

export interface ShopkeeperEquipmentSlot {
  DataVersion: number;
  id: string;
  count: number;
  components?: ShopkeeperItemComponent;
}

export interface ShopkeeperEquipment {
  HAND?: ShopkeeperEquipmentSlot;
  OFF_HAND?: ShopkeeperEquipmentSlot;
  HEAD?: ShopkeeperEquipmentSlot;
  CHEST?: ShopkeeperEquipmentSlot;
  LEGS?: ShopkeeperEquipmentSlot;
  FEET?: ShopkeeperEquipmentSlot;
}

export interface ShopkeeperObject {
  type: string;
  equipment?: ShopkeeperEquipment;
  baby: boolean;
  profession?: string;
  villagerType?: string;
  villagerLevel?: number;
}

export interface Shopkeeper {
  key: string;
  uniqueId: string;
  world: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  type: string;
  name: string;
  object: ShopkeeperObject;
  'owner uuid': string;
  owner: string;
  chestx: number;
  chesty: number;
  chestz: number;
  offers: ShopkeeperOffer[];
  snapshots: unknown[];
  chestContents: ChestSlot[] | null;
}

export interface ShopkeepersData {
  dataVersion: string;
  total: number;
  shopkeepers: Shopkeeper[];
}

@Injectable()
export class ShopkeepersService {
  private readonly logger = new Logger(ShopkeepersService.name);
  private cache: { data: ShopkeepersData; ts: number } | null = null;
  private readonly CACHE_TTL_MS = 15 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

  async fetchAll(): Promise<ShopkeepersData> {
    if (this.cache && Date.now() - this.cache.ts < this.CACHE_TTL_MS) {
      return this.cache.data;
    }

    const url = `${process.env.URL_FOR_SERVER_API}/get_shopkeepers_with_chest_new`;
    const { data } = await axios.post<ShopkeepersData>(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN_FOR_SERVER_API}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.cache = { data, ts: Date.now() };
    return data;
  }

  async compass(discordId: string, x: number, z: number): Promise<{ ok?: string; error?: string }> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: discordId },
      select: { username: true },
    });

    if (!user?.username) {
      return { error: 'Ник не найден. Убедитесь что аккаунт привязан.' };
    }

    const url = `${process.env.URL_FOR_SERVER_API}/compass_new`;
    this.logger.log(`compass request: POST ${url} body=${JSON.stringify({ username: user.username, x, z, world: 'gmgame' })}`);
    try {
      const { data } = await axios.post(
        url,
        { username: user.username, x, z, world: 'gmgame' },
        { headers: { Authorization: `Bearer ${process.env.TOKEN_FOR_SERVER_API}`, 'Content-Type': 'application/json' } },
      );
      return data as { ok?: string; error?: string };
    } catch (err) {
      this.logger.error(`compass error: ${err}`);
      return { error: 'Ошибка при отправке команды на сервер' };
    }
  }
}
