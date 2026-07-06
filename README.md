# MindBodyHub

Монорепозиторий платформы MindBodyHub.

## Пакеты

| Папка | Описание | Статус |
|-------|----------|--------|
| [`mindbodyhub-front/`](mindbodyhub-front/) | Публичный сайт (Next.js) | в разработке |
| `mindbodyhub-admin/` | Админ-панель | планируется |
| [`mindbodyhub-back/`](mindbodyhub-back/) | API / backend (NestJS) | заготовка |
| [`bots/`](bots/) | VK-бот | работает отдельно |
| [`legacy/static-site/`](legacy/static-site/) | Старый статический сайт | архив |

## Быстрый старт — frontend

```bash
cd mindbodyhub-front
npm install
npm run dev
```

## Быстрый старт — backend

```bash
cd mindbodyhub-back
cp .env.example .env
docker-compose up -d
npm install
npm run start:dev
```

При первом старте, если в `.env` заданы `ADMIN_PHONE` и `ADMIN_PASSWORD` и в БД ещё нет админов, создаётся пользователь с ролью `admin`.

API: http://localhost:4000/health

### Auth

```bash
# Регистрация
curl -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"phone":"89001234567","password":"password123"}'

# Вход
curl -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+79001234567","password":"password123"}'

# Текущий пользователь
curl http://localhost:4000/auth/me -H "Authorization: Bearer <accessToken>"
```

## VK-бот

```bash
cd bots
npm install
npm start
```