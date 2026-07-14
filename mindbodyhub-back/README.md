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

1. Copy env file on server:

```bash
cp .env.production.example .env
# Заполните секреты: JWT, DB, MinIO, ADMIN
```

2. Start stack:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

3. Configure Nginx (see `deploy/nginx/mindbodyhub.pro.conf`):

| Domain | Purpose |
|--------|---------|
| `api.mindbodyhub.pro` | NestJS API |
| `storage.mindbodyhub.pro` | MinIO S3 API (public files) |
| `storage-admin.mindbodyhub.pro` | MinIO Console (restrict access!) |
| `mindbodyhub.pro` | Frontend (Next.js) |

4. Set `MINIO_PUBLIC_URL=https://storage.mindbodyhub.pro` in `.env`

5. Frontend: `NEXT_PUBLIC_API_BASE_URL=https://api.mindbodyhub.pro`

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
