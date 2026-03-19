import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import axios from 'axios';

export interface ShopkeeperItemComponent {
  /** Кастомное имя предмета (JSON-строка компонента Text Component) */
  'minecraft:custom_name'?: string;
  /** Чары предмета (JSON-строка) */
  'minecraft:enchantments'?: string;
  /** Хранимые чары (для зачарованных книг, JSON-строка) */
  'minecraft:stored_enchantments'?: string;
  /** Стоимость починки предмета */
  'minecraft:repair_cost'?: string;
  /** Содержимое контейнера (для шалкеров и др., JSON-строка) */
  'minecraft:container'?: string;
  /** Прочность предмета */
  'minecraft:damage'?: string | number;
  /** Флаги скрытых атрибутов */
  'minecraft:hide_additional_tooltip'?: unknown;
  /** Атрибуты предмета (JSON-строка) */
  'minecraft:attribute_modifiers'?: string;
  /** Описание предмета (lore, JSON-строка) */
  'minecraft:lore'?: string;
  /** Пользовательские данные предмета */
  [key: string]: unknown;
}

export interface ShopkeeperItem {
  /** Версия формата данных Minecraft */
  DataVersion: number;
  /** Идентификатор предмета (например, minecraft:diamond) */
  id: string;
  /** Количество предметов в стаке */
  count: number;
  /** Компоненты предмета (чары, имя, содержимое и др.) */
  components?: ShopkeeperItemComponent;
}

export interface ShopkeeperOffer {
  /** Итоговый предмет (товар, который покупатель получает) */
  resultItem: ShopkeeperItem;
  /** Первый предмет оплаты */
  item1: ShopkeeperItem;
  /** Второй предмет оплаты (опционально — двойная цена) */
  item2?: ShopkeeperItem;
}

export interface ShopkeeperEquipmentSlot {
  /** Версия формата данных Minecraft */
  DataVersion: number;
  /** Идентификатор предмета в слоте */
  id: string;
  /** Количество предметов */
  count: number;
  /** Компоненты предмета */
  components?: ShopkeeperItemComponent;
}

export interface ShopkeeperEquipment {
  /** Предмет в правой руке (показывает «товар» витрины) */
  HAND?: ShopkeeperEquipmentSlot;
  /** Предмет в левой руке */
  OFF_HAND?: ShopkeeperEquipmentSlot;
  /** Предмет на голове */
  HEAD?: ShopkeeperEquipmentSlot;
  /** Нагрудник */
  CHEST?: ShopkeeperEquipmentSlot;
  /** Поножи */
  LEGS?: ShopkeeperEquipmentSlot;
  /** Ботинки */
  FEET?: ShopkeeperEquipmentSlot;
}

export interface ShopkeeperObject {
  /** Тип сущности-продавца (всегда villager в данном файле) */
  type: string;
  /** Снаряжение сущности (предметы в руках и на теле) */
  equipment?: ShopkeeperEquipment;
  /** Флаг детёныша (true — детёныш, false — взрослый) */
  baby: boolean;
  /** Профессия жителя (например, minecraft:cleric) */
  profession?: string;
  /** Тип биома жителя (например, minecraft:desert) */
  villagerType?: string;
  /** Уровень жителя (1–5) */
  villagerLevel?: number;
}

export interface Shopkeeper {
  /** Внутренний числовой ключ записи из файла */
  key: string;
  /** Уникальный UUID витрины */
  uniqueId: string;
  /** Название мира, в котором расположена витрина */
  world: string;
  /** Координата X витрины */
  x: number;
  /** Координата Y витрины */
  y: number;
  /** Координата Z витрины */
  z: number;
  /** Поворот сущности (yaw, градусы) */
  yaw: number;
  /** Тип витрины (trade — торговля) */
  type: string;
  /** Отображаемое имя витрины */
  name: string;
  /** Данные сущности-продавца (внешний вид, снаряжение) */
  object: ShopkeeperObject;
  /** Discord ID или UUID владельца витрины */
  'owner uuid': string;
  /** Ник владельца витрины в Minecraft */
  owner: string;
  /** Координата X сундука с товарами */
  chestx: number;
  /** Координата Y сундука с товарами */
  chesty: number;
  /** Координата Z сундука с товарами */
  chestz: number;
  /** Список сделок (торговых предложений) витрины */
  offers: ShopkeeperOffer[];
  /** Снимки состояния витрины (используется плагином для резервных копий) */
  snapshots: unknown[];
}

export interface ShopkeepersData {
  /** Версия данных файла сохранения Shopkeepers */
  dataVersion: string;
  /** Общее количество витрин */
  total: number;
  /** Список всех витрин */
  shopkeepers: Shopkeeper[];
}

@Injectable()
export class ShopkeepersService {
  private readonly logger = new Logger(ShopkeepersService.name);
  private readonly saveFilePath = path.resolve(process.cwd(), 'save.yml');

  constructor(private readonly prisma: PrismaService) {}

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

  parse(): ShopkeepersData {
    let raw: string;
    try {
      raw = fs.readFileSync(this.saveFilePath, 'utf8');
    } catch (err) {
      this.logger.error(`Не удалось прочитать файл save.yml: ${err.message}`);
      throw err;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = yaml.load(raw) as Record<string, unknown>;
    } catch (err) {
      this.logger.error(`Ошибка парсинга YAML: ${err.message}`);
      throw err;
    }

    const dataVersion = String(parsed['data-version'] ?? '');

    const shopkeepers: Shopkeeper[] = [];

    for (const [key, value] of Object.entries(parsed)) {
      if (key === 'data-version') continue;

      const entry = value as Record<string, unknown>;

      const offersRaw = (entry['offers'] ?? {}) as Record<string, unknown>;
      const offers: ShopkeeperOffer[] = Object.values(offersRaw).map((o) => {
        const offer = o as Record<string, unknown>;
        return {
          resultItem: this.parseItem(offer['resultItem']),
          item1: this.parseItem(offer['item1']),
          item2: offer['item2'] ? this.parseItem(offer['item2']) : undefined,
        };
      });

      const objectRaw = (entry['object'] ?? {}) as Record<string, unknown>;
      const equipmentRaw = (objectRaw['equipment'] ?? {}) as Record<string, unknown>;

      const equipment: ShopkeeperEquipment = {};
      for (const slot of ['HAND', 'OFF_HAND', 'HEAD', 'CHEST', 'LEGS', 'FEET'] as const) {
        if (equipmentRaw[slot]) {
          equipment[slot] = this.parseItem(equipmentRaw[slot]) as ShopkeeperEquipmentSlot;
        }
      }

      const shopkeeperObject: ShopkeeperObject = {
        type: String(objectRaw['type'] ?? ''),
        baby: Boolean(objectRaw['baby'] ?? false),
        equipment: Object.keys(equipment).length ? equipment : undefined,
        profession: objectRaw['profession'] ? String(objectRaw['profession']) : undefined,
        villagerType: objectRaw['villagerType'] ? String(objectRaw['villagerType']) : undefined,
        villagerLevel: objectRaw['villagerLevel'] != null ? Number(objectRaw['villagerLevel']) : undefined,
      };

      shopkeepers.push({
        key,
        uniqueId: String(entry['uniqueId'] ?? ''),
        world: String(entry['world'] ?? ''),
        x: Number(entry['x'] ?? 0),
        y: Number(entry['y'] ?? 0),
        z: Number(entry['z'] ?? 0),
        yaw: Number(entry['yaw'] ?? 0),
        type: String(entry['type'] ?? ''),
        name: String(entry['name'] ?? ''),
        object: shopkeeperObject,
        'owner uuid': String(entry['owner uuid'] ?? ''),
        owner: String(entry['owner'] ?? ''),
        chestx: Number(entry['chestx'] ?? 0),
        chesty: Number(entry['chesty'] ?? 0),
        chestz: Number(entry['chestz'] ?? 0),
        offers,
        snapshots: Array.isArray(entry['snapshots']) ? entry['snapshots'] : [],
      });
    }

    return {
      dataVersion,
      total: shopkeepers.length,
      shopkeepers,
    };
  }

  private parseItem(raw: unknown): ShopkeeperItem {
    if (!raw || typeof raw !== 'object') {
      return { DataVersion: 0, id: '', count: 0 };
    }
    const item = raw as Record<string, unknown>;
    const componentsRaw = item['components'];
    const components: ShopkeeperItemComponent | undefined = componentsRaw
      ? (componentsRaw as ShopkeeperItemComponent)
      : undefined;

    return {
      DataVersion: Number(item['DataVersion'] ?? 0),
      id: String(item['id'] ?? ''),
      count: Number(item['count'] ?? 0),
      components,
    };
  }
}
