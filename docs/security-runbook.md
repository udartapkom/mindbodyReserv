# Security ops runbook — MindBodyHub

Операционка по секретам и bootstrap админа. План угроз и код-фиксы: `security-hardening.md`.

**Где живут секреты:** только серверный `/opt/mindbodyhub/back/.env` (и локальные `.env`, не в git).  
Шаблоны без секретов: `mindbodyhub-back/.env.example`, front/admin `.env.example`.

---

## 1. Admin seed и `ADMIN_PASSWORD`

### Как работает

При старте API `AdminSeedService`:

1. Если нет `ADMIN_PHONE` или `ADMIN_PASSWORD` — seed пропускается (норма для prod после bootstrap).
2. Если пользователь с этим телефоном уже есть и роль `admin` — ничего не меняет.
3. Если пользователь есть, но не admin — **не** повышает роль автоматически.
4. Если пользователя нет — создаёт admin с argon2-хешем пароля.

Пароль из env **не** перезаписывает существующего админа при рестартах.

### Prod checklist (обязательно)

1. Один раз задайте сильные `ADMIN_PHONE` + `ADMIN_PASSWORD` в `/opt/mindbodyhub/back/.env`.
2. Запустите/перезапустите API, убедитесь в логе: `Admin user created: …` или `already admin`.
3. Войдите в админку, смените пароль через UI (смена отзывает все refresh-сессии).
4. **Удалите `ADMIN_PASSWORD` из prod `.env`** (и при желании оставьте только `ADMIN_PHONE` как метку или уберите оба).
5. Перезапустите PM2-процесс API.
6. Убедитесь, что в логе: `Admin seed skipped: ADMIN_PHONE or ADMIN_PASSWORD not set` — это ожидаемо.

Если в production после того, как admin уже есть, `ADMIN_PASSWORD` всё ещё в env — API пишет **warn** в лог при старте.

### Если потеряли пароль админа

Публичного «восстановить пароль» нет. Варианты:

- Сбросить хеш в БД вручную (argon2id) — только с доступом к Postgres и с аудитом.
- Или временно вернуть `ADMIN_PASSWORD` **не поможет**, если пользователь уже существует (seed не обновляет пароль). Нужен SQL/скрипт с новым хешем или создание другого admin-телефона через временный seed **нового** номера, затем promote/cleanup.

Пример генерации хеша локально (Node + argon2 из `mindbodyhub-back`):

```bash
cd mindbodyhub-back
node -e "require('argon2').hash('NewStrong_Pass1!').then(console.log)"
```

Затем обновить `users.password_hash` для нужного phone и **сразу** отозвать refresh (таблица refresh-токенов / рестарт логики revoke).

---

## 2. Какие секреты критичны

| Переменная | Назначение | Fail-fast в prod |
|------------|------------|------------------|
| `JWT_ACCESS_SECRET` | Подпись access JWT (≥32 символа, не дефолт) | да |
| `DB_PASSWORD` | PostgreSQL | да (не `devpassword` и т.п.) |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | Object storage | да (не `minioadmin`) |
| `PLATEGA_SECRET` (+ merchant id) | Платежи / webhook | нет (оплаты просто не работают) |
| `VAPID_PRIVATE_KEY` | Web Push | нет (push выключен) |
| `VK_BOT_TOKEN` | Алерты в VK | нет |

**Не использовать:** `JWT_REFRESH_SECRET` — refresh не JWT, переменная нигде не читается. Удалите из старых `.env`, чтобы не путать.

Публичные (можно в front): `NEXT_PUBLIC_*`, `VITE_*`, `VAPID_PUBLIC_KEY` отдаётся API клиентам.

---

## 3. Ротация секретов

Делать по одному типу за раз, в окно низкой нагрузки. После правок `.env` — `pm2 restart` API (или ваш обычный deploy).

### 3.1 `JWT_ACCESS_SECRET`

1. Сгенерировать новый секрет (≥32 случайных байта, например `openssl rand -base64 48`).
2. Прописать в `.env`, перезапустить API.
3. **Эффект:** все access JWT становятся невалидны сразу; пользователи обновляют сессию через refresh (refresh не завязан на JWT secret). Если refresh ещё жив — UX почти незаметен; иначе — повторный login.

### 3.2 Refresh-сессии (без отдельного секрета)

Отозвать всех: SQL truncate/delete по таблице refresh-токенов или админ-действие «снять с панели» / смена пароля пользователя.  
После инцидента: массовый revoke + смена `JWT_ACCESS_SECRET`.

### 3.3 `DB_PASSWORD`

1. Сменить пароль роли в PostgreSQL.
2. Обновить `DB_PASSWORD` в `.env`.
3. Перезапустить API. MinIO/прочее не затрагивается.

### 3.4 MinIO keys

1. Создать новые ключи в MinIO / сменить root (зависит от установки).
2. Обновить `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` (и при Docker-dev — `MINIO_ROOT_*`).
3. Перезапустить API. Старые ключи отключить после проверки upload/avatar.

### 3.5 Platega

1. В кабинете Platega выпустить/сменить merchant secret.
2. Обновить `PLATEGA_MERCHANT_ID` / `PLATEGA_SECRET`.
3. Перезапустить API. Проверить create payment + тестовый webhook. Старый secret перестанет принимать webhook.

### 3.6 VAPID

1. `npx web-push generate-vapid-keys`.
2. Обновить `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`.
3. Перезапустить API.
4. **Эффект:** старые push-подписки перестают работать — пользователям нужно заново разрешить уведомления (переподписка с новым public key).

### 3.7 VK bot token

Сменить токен в VK, обновить `VK_BOT_TOKEN` / `VK_ADMIN_ID`, перезапустить API. На логин пользователей не влияет.

---

## 4. Первый запуск / новый стенд

1. `cp mindbodyhub-back/.env.example .env` — заполнить сильные секреты.
2. Поднять Postgres + MinIO, применить миграции из `deploy/migrations/`.
3. `NODE_ENV=production` на сервере → TypeORM `synchronize: false`; без сильных JWT/DB/MinIO API **не стартует** (`assertProductionSecrets`).
4. Seed админа → удалить `ADMIN_PASSWORD` из env (§1).
5. Проверить: `GET /health`, логин админки, CORS с фронта.

---

## 5. Что проверить после инцидента (кратко)

- [ ] Сменён `JWT_ACCESS_SECRET` и при необходимости отозваны refresh
- [ ] Сменены пароли затронутых admin/user
- [ ] Platega / MinIO / VAPID / VK — по факту компрометации
- [ ] `ADMIN_PASSWORD` отсутствует в prod `.env`
- [ ] nginx `limit_req` на месте (см. `deploy/nginx/mindbodyhub.pro.conf`)
- [ ] Логи: всплески 401/429 на `/auth/*`
