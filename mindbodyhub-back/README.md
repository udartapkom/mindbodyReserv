# MindBodyHub Backend

NestJS API + PostgreSQL + MinIO (S3-compatible storage for avatars and course materials).

## Development (Docker)

**Requirements:** Docker Engine 20+ and **Compose v2** (`docker compose`). The legacy `docker-compose` v1.29 is incompatible with Docker Engine 29+ (`KeyError: 'ContainerConfig'`). Install v2:

```bash
# Ubuntu/Debian (recommended)
sudo apt install docker-compose-v2

# Or user-local plugin (no sudo)
mkdir -p ~/.docker/cli-plugins
curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
docker compose version
```

```bash
cd mindbodyhub-back
cp .env.example .env
# Отредактируйте ADMIN_PHONE и ADMIN_PASSWORD

docker compose up --build
```

Services:

| Service | URL |
|---------|-----|
| API | http://localhost:4000 |
| PostgreSQL | localhost:5432 |
| MinIO S3 API | http://localhost:9000 |
| MinIO Console | http://localhost:9001 |

Buckets created automatically:

- `avatars` — private (presigned URLs)
- `materials` — public read (images in course content)

Health check: `GET http://localhost:4000/health`

## Production (mindbodyhub.pro)

Small VPS (~1GB RAM): **без Docker** — PostgreSQL + MinIO + PM2 + nginx.

Домены: `mindbodyhub.pro`, `www`, `api`, `admin`, `minio`.

### Первый запуск (уже сделан на сервере)

См. `deploy/bootstrap-server.sh` и nginx `deploy/nginx/mindbodyhub.pro.conf`.

### Обновления с локальной машины

```bash
# SSH-ключ на сервер (рекомендуется вместо пароля)
export DEPLOY_HOST=root@89.108.71.23
./mindbodyhub-back/deploy/deploy-remote.sh
```

После SQL-изменений сначала примените файл из `deploy/migrations/` на сервере, затем деплой.

### Env на сервере

`/opt/mindbodyhub/back/.env` — секреты только на сервере, не в git.

`NODE_ENV=production` → TypeORM `synchronize: false`.

VK-оповещения админу (оплаты + тикеты):

```env
VK_BOT_TOKEN=
VK_ADMIN_ID=
ADMIN_PANEL_URL=https://admin.mindbodyhub.pro
```

(значения из `bots/.env`: `VK_BOT_TOKEN` и `ADMIN_ID` → `VK_ADMIN_ID`)

## Storage module

`StorageService` (global) methods:

- `uploadFile()` — upload to bucket
- `getPresignedUrl()` — temporary URL for private files (avatars)
- `getObjectUrl()` — public URL for materials bucket
- `deleteFile()` — remove object

## Local development without Docker API

Run only infrastructure:

```bash
docker compose up postgres minio minio-init -d
npm run start:dev
```

Use `DB_HOST=localhost` and `MINIO_ENDPOINT=localhost` in `.env`.
