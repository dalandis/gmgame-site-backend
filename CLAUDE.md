# CLAUDE.md — gmgame-site-backend

NestJS бэкенд игрового Minecraft-проекта gmgame. Управление пользователями, интеграция с Discord OAuth, Minecraft Server API, Redis-очереди, Minio S3.

## Стек

- **Framework:** NestJS 10, TypeScript 4
- **Database:** PostgreSQL + Prisma ORM 5
- **Cache/Sessions:** Redis (localhost:6379), express-session + connect-redis
- **Queues:** Bull 4 + BullMQ 3, Bull Board UI на `/admin/queues`
- **Auth:** passport-discord (OAuth2), passport-http-bearer
- **Storage:** Minio S3 (static.gmgame.ru:443), Sharp для изображений
- **HTTP:** Axios

## Запуск

```bash
npm install
npx prisma generate       # генерация клиента
npm run start:dev         # dev с hot reload (порт 3001)
npm run build && npm run start:prod  # production
```

Требуется PostgreSQL, Redis (localhost:6379), Minio, Discord Bot + OAuth App.

## Конфигурация — файлы .env

Проект использует несколько `.env.*` файлов (все загружаются через `ConfigModule`):

| Файл | Назначение |
|---|---|
| `.env` | `DATABASE_URL`, `ADMINS_IDS`, `BASIC_AUTH_USERNAME/PASSWORD` |
| `.env.discord` | `SECRET_SESSION`, `AUTH_CLIENT_ID/SECRET`, `AUTH_CALLBACK`, webhooks |
| `.env.bearer` | `SUPERHUB_BEARER`, `GMGAME_BEARER`, `BAXY_BEARER` |
| `.env.api` | `SECRET_KEY_FOR_VOTE_MINESERV/HOTMC`, `CHANCE_MONEY`, `CHANCE_TOOLS` |
| `.env.minio` | `MINIO_END_POINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY/SECRET_KEY` |
| `.env.server-api` | `URL_FOR_SERVER_API`, `TOKEN_FOR_SERVER_API`, `URL_FOR_BOT_API`, `TOKEN_FOR_BOT_API`, webhooks |

## Структура модулей

```
src/
├── auth/            # Discord OAuth + Bearer стратегии, guards, roles
├── users/           # CRUD пользователей, Queue: users
├── territories/     # Территории игроков
├── markers/         # Маркеры на карте, Queue: markers
├── awards/          # Награды
├── gallery/         # Галерея изображений (Minio + Sharp)
├── shops/           # Магазины
├── statistics/      # Статистика, vote-параметры
├── tickets/         # Тикеты/заявки
├── faq/             # FAQ с категориями
├── goals/           # Глобальные цели проекта
├── logs/            # Audit logs
├── admin/           # Административный интерфейс
├── process-queues/  # Обработчики Bull-очередей
├── cron/            # Cron-задачи (suspend, citizenship)
├── external-api/    # Webhooks, Vote API (MINESERV, HOTMC)
├── data-provider/   # Слой интеграции: Server API, Bot API, Discord Webhooks, Mojang
├── prisma/          # PrismaService (global)
├── Utils/           # Вспомогательные функции
├── validator/       # DTO + class-validator
└── common/          # Общие типы
```

## Аутентификация

**Discord OAuth** → сессия в Redis → роль назначается по `ADMINS_IDS` и `status` в БД:
- `admin` — Discord ID в `ADMINS_IDS`
- `player` — status = 2
- `user` — остальные

**Bearer Token** → роль по токену:
- `SUPERHUB_BEARER` → `superhub`
- `GMGAME_BEARER` → `bot`
- `BAXY_BEARER` → `streamers`

Guards: `AuthenticatedGuard`, `BearerGuard`, `RoleGuard`, `LoginGuard`.

## Статусы пользователей

| Код | Значение |
|---|---|
| 2 | Активный |
| 3 | Отклонён |
| 4 | Бан |
| 5 | Приостановлен |
| 6 | Удалён |
| 7 | В архиве |

## Bull-очереди

| Очередь | Действия |
|---|---|
| `users` | `delete-user`, `suspend-user`, `ban-user`, `resume-user`, `unban-user`, `accept-user`, `create-new-user-ticket` |
| `cron-tasks` | `suspend-time`, `suspend-discord` |
| `markers` | `refreshMarkers-{server}-{type}` |
| `citizenship` | `citizenship` |

**Паттерн job:**
```typescript
{ action: string; id: string; username: string; manager: string; payload?: any }
```

**Cron-расписание** (timezone: Europe/Moscow):
- `01:00` ежедневно — проверка expiration_date, suspend
- `03:00` ежедневно — обновление citizenship

## Prisma — модели БД

Ключевые связи: `users` → `territories`, `markers`, `awards`, `tickets`, `logs`, `gallery`, `oldUsers`

Используются previewFeatures: `omitApi`, `metrics`, `relationJoins`.

Миграции:
```bash
npx prisma migrate dev --create-only --name migration_name
npx prisma migrate deploy
npx prisma generate
```

## Внешние интеграции (DataProviderService)

- **Minecraft Server API** — whitelist управление (`add_wl_new`, `del_wl_new`)
- **Bot API** — управление Discord-ролями (`add_role`, `remove_role`, `create_ticket`)
- **Discord Webhooks** — уведомления о регистрации и наградах
- **Mojang API** — получение UUID по нику (`https://api.mojang.com/users/profiles/minecraft/{username}`)

## Соглашения кода

- Все модули используют `PrismaModule` (global) — не добавлять его в каждый модуль отдельно
- Асинхронные операции с пользователями идут через очереди, не напрямую
- Логирование всех действий через `logs` таблицу (после выполнения job)
- Теги пользователей хранятся в JSON (`tag: Json`)
- `user_id` — это Discord ID (string), не числовой `id`
- Статика фронтенда (`gmgame-site/build`) раздаётся через `ServeStaticModule`
- CORS разрешён только для `https://map.gmgame.ru`
- Порт: `3001`
