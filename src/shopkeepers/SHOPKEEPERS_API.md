# API Витрин (Shopkeepers)

## Эндпоинт

```
GET /api/shopkeepers
```

Авторизация не требуется. Возвращает все витрины из файла `save.yml` (плагин Shopkeepers).

---

## Структура ответа

```jsonc
{
  "dataVersion": "4|2|4440",   // версия формата файла сохранения
  "total": 25,                  // общее количество витрин
  "shopkeepers": [ ... ]        // массив витрин
}
```

---

## Объект `ShopkeepersData`

| Поле | Тип | Описание |
|---|---|---|
| `dataVersion` | `string` | Версия формата файла `save.yml` (формат `major\|minor\|dataVersion`) |
| `total` | `number` | Общее количество витрин в файле |
| `shopkeepers` | `Shopkeeper[]` | Массив всех витрин |

---

## Объект `Shopkeeper`

| Поле | Тип | Описание |
|---|---|---|
| `key` | `string` | Внутренний числовой ключ записи из YAML-файла |
| `uniqueId` | `string` | Уникальный UUID витрины (формат UUID v4) |
| `world` | `string` | Название мира, в котором расположена витрина (например, `gmgame`) |
| `x` | `number` | Координата X сущности-продавца |
| `y` | `number` | Координата Y сущности-продавца |
| `z` | `number` | Координата Z сущности-продавца |
| `yaw` | `number` | Угол поворота сущности по горизонтали (градусы, 0–360) |
| `type` | `string` | Тип витрины (`trade` — торговая) |
| `name` | `string` | Отображаемое название витрины (задаётся владельцем) |
| `object` | `ShopkeeperObject` | Данные сущности-продавца (жителя) |
| `owner uuid` | `string` | UUID владельца витрины (UUID Minecraft-аккаунта) |
| `owner` | `string` | Ник владельца витрины в Minecraft |
| `chestx` | `number` | Координата X привязанного сундука с товарами |
| `chesty` | `number` | Координата Y привязанного сундука с товарами |
| `chestz` | `number` | Координата Z привязанного сундука с товарами |
| `offers` | `ShopkeeperOffer[]` | Список торговых предложений витрины |
| `snapshots` | `unknown[]` | Снимки состояния (используются плагином для резервных копий; как правило пусты) |

---

## Объект `ShopkeeperObject`

Описывает сущность-продавца (NPC жителя).

| Поле | Тип | Обязательное | Описание |
|---|---|---|---|
| `type` | `string` | Да | Тип сущности (всегда `villager` в текущем файле) |
| `equipment` | `ShopkeeperEquipment` | Нет | Снаряжение сущности (предметы в руках и на теле) |
| `baby` | `boolean` | Да | Флаг детёныша: `true` — детёныш, `false` — взрослый |
| `profession` | `string` | Нет | Профессия жителя (например, `minecraft:cleric`, `minecraft:mason`) |
| `villagerType` | `string` | Нет | Биомный тип жителя (например, `minecraft:desert`, `minecraft:plains`) |
| `villagerLevel` | `number` | Нет | Уровень жителя от 1 до 5 |

### Возможные профессии жителей (`profession`)

| Значение | Профессия |
|---|---|
| `minecraft:armorer` | Бронник |
| `minecraft:butcher` | Мясник |
| `minecraft:cartographer` | Картограф |
| `minecraft:cleric` | Священник |
| `minecraft:farmer` | Фермер |
| `minecraft:fisherman` | Рыбак |
| `minecraft:fletcher` | Стрелок |
| `minecraft:leatherworker` | Кожевник |
| `minecraft:librarian` | Библиотекарь |
| `minecraft:mason` | Каменщик |
| `minecraft:nitwit` | Болван |
| `minecraft:shepherd` | Пастух |
| `minecraft:toolsmith` | Кузнец инструментов |
| `minecraft:weaponsmith` | Оружейник |

### Возможные биомные типы жителей (`villagerType`)

| Значение | Биом |
|---|---|
| `minecraft:desert` | Пустыня |
| `minecraft:jungle` | Джунгли |
| `minecraft:plains` | Равнина |
| `minecraft:savanna` | Саванна |
| `minecraft:snow` | Снег |
| `minecraft:swamp` | Болото |
| `minecraft:taiga` | Тайга |

---

## Объект `ShopkeeperEquipment`

Снаряжение сущности-продавца. Все поля опциональны.

| Поле | Тип | Описание |
|---|---|---|
| `HAND` | `ShopkeeperEquipmentSlot` | Предмет в правой руке (визуально показывает «витринный товар») |
| `OFF_HAND` | `ShopkeeperEquipmentSlot` | Предмет в левой руке |
| `HEAD` | `ShopkeeperEquipmentSlot` | Предмет на голове (шлем/блок) |
| `CHEST` | `ShopkeeperEquipmentSlot` | Нагрудник |
| `LEGS` | `ShopkeeperEquipmentSlot` | Поножи |
| `FEET` | `ShopkeeperEquipmentSlot` | Ботинки |

---

## Объект `ShopkeeperOffer`

Одно торговое предложение витрины.

| Поле | Тип | Обязательное | Описание |
|---|---|---|---|
| `resultItem` | `ShopkeeperItem` | Да | Товар, который покупатель получает в результате сделки |
| `item1` | `ShopkeeperItem` | Да | Первый предмет оплаты (основная «валюта») |
| `item2` | `ShopkeeperItem` | Нет | Второй предмет оплаты (дополнительная «валюта»; при наличии — двойная стоимость) |

---

## Объект `ShopkeeperItem` / `ShopkeeperEquipmentSlot`

Описывает конкретный предмет Minecraft.

| Поле | Тип | Обязательное | Описание |
|---|---|---|---|
| `DataVersion` | `number` | Да | Версия данных формата предмета Minecraft (совпадает с версией игры) |
| `id` | `string` | Да | Идентификатор предмета в пространстве имён (например, `minecraft:diamond`) |
| `count` | `number` | Да | Количество предметов в стаке |
| `components` | `ShopkeeperItemComponent` | Нет | Компоненты предмета (чары, имя, содержимое и др.) |

---

## Объект `ShopkeeperItemComponent`

Дополнительные компоненты предмета. Все поля опциональны.

| Поле | Тип | Описание |
|---|---|---|
| `minecraft:custom_name` | `string` | Пользовательское имя предмета в формате JSON Text Component Minecraft |
| `minecraft:enchantments` | `string` | Чары предмета (JSON-строка вида `{"minecraft:mending":1,"minecraft:unbreaking":3}`) |
| `minecraft:stored_enchantments` | `string` | Хранимые чары (только для зачарованных книг; формат аналогичен `enchantments`) |
| `minecraft:repair_cost` | `string` | Стоимость починки предмета на наковальне (число в виде строки) |
| `minecraft:container` | `string` | Содержимое контейнера (для шалкеров, сундуков и др.; JSON-массив слотов) |
| `minecraft:damage` | `string \| number` | Текущий урон (износ) предмета |
| `minecraft:hide_additional_tooltip` | `unknown` | Флаг скрытия дополнительной подсказки предмета |
| `minecraft:attribute_modifiers` | `string` | Модификаторы атрибутов предмета (JSON-строка) |
| `minecraft:lore` | `string` | Описание предмета (JSON-строка массива строк Text Component) |

### Формат `minecraft:container`

Массив слотов контейнера (шалкер, сундук). Каждый элемент:

```jsonc
{
  "slot": 0,           // номер слота (0–26 для шалкера)
  "item": {
    "id": "minecraft:diamond",
    "count": 64
  }
}
```

### Формат `minecraft:enchantments` / `minecraft:stored_enchantments`

JSON-объект: ключ — идентификатор чара, значение — уровень.

```jsonc
{
  "minecraft:sharpness": 5,
  "minecraft:looting": 3
}
```

### Формат `minecraft:custom_name`

JSON Text Component Minecraft:

```jsonc
{
  "extra": [
    {
      "bold": false,
      "color": "gold",
      "italic": false,
      "obfuscated": false,
      "strikethrough": false,
      "underlined": false,
      "text": "Название"
    }
  ],
  "text": ""
}
```

---

## Пример ответа

```jsonc
{
  "dataVersion": "4|2|4440",
  "total": 25,
  "shopkeepers": [
    {
      "key": "4",
      "uniqueId": "5c4f4f4a-9420-48b7-9861-f0a907666d06",
      "world": "gmgame",
      "x": -392,
      "y": 74,
      "z": 72,
      "yaw": 240.0,
      "type": "trade",
      "name": "PandaTreasure",
      "object": {
        "type": "villager",
        "equipment": {
          "HAND": {
            "DataVersion": 4440,
            "id": "minecraft:elytra",
            "count": 1,
            "components": {
              "minecraft:repair_cost": "3",
              "minecraft:enchantments": "{\"minecraft:mending\":1,\"minecraft:unbreaking\":3}"
            }
          }
        },
        "baby": false,
        "profession": "minecraft:cleric",
        "villagerType": "minecraft:savanna",
        "villagerLevel": 5
      },
      "owner uuid": "e213ba3b-8dc6-4963-8dcc-1ce28c590f9c",
      "owner": "SoftPanda3",
      "chestx": -392,
      "chesty": 78,
      "chestz": 67,
      "offers": [
        {
          "resultItem": {
            "DataVersion": 4440,
            "id": "minecraft:elytra",
            "count": 1,
            "components": {
              "minecraft:repair_cost": "3",
              "minecraft:enchantments": "{\"minecraft:mending\":1,\"minecraft:unbreaking\":3}"
            }
          },
          "item1": {
            "DataVersion": 4440,
            "id": "minecraft:deepslate_diamond_ore",
            "count": 40
          }
        }
      ],
      "snapshots": []
    }
  ]
}
```
