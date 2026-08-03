# План защиты API: брутфорс и смежные угрозы

Аудит бэкенда `mindbodyhub-back` (июль 2026). Цель — зафиксировать, что уже есть, где дыры, и порядок работ.

---

## Краткий вердикт

**База auth в порядке:** argon2id, JWT + opaque refresh с ротацией и хешем в БД, глобальные `JwtAuthGuard` / `RolesGuard`, строгий `ValidationPipe`, CORS allowlist в prod, проверка секрета webhook Platega, лимиты размера/MIME на upload.

**Главный пробел (закрыт для P0–P1):** Nest throttler + lockout + reuse detection + abuse limits. Ops D.4–D.5 и runbook E.2 — в `docs/security-runbook.md` + `.env.example`. Остаётся E.1 метрики и E.3–E.4 по необходимости.

---

## Что уже реализовано

| Область | Как сейчас | Где |
|---------|------------|-----|
| Хеш паролей | argon2id (дефолты библиотеки) | `auth.service.ts` |
| Политика пароля | 8+, верхний регистр, цифра, спецсимвол | `password.util.ts` + DTO |
| Access JWT | короткий TTL (по умолчанию ~15m), проверка `type`, роль перечитывается из БД | `jwt.strategy.ts` |
| Refresh | opaque `randomBytes(48)`, SHA-256 в БД, ротация при использовании | `auth.service.ts` |
| Отзыв сессий | при блокировке / снятии с панели | `users.controller.ts` + `revokeAllRefreshTokens` |
| Guards | JWT глобально, `@Public()` точечно, `@Roles(ADMIN\|EDITOR)` | `auth.module.ts` |
| Валидация входа | `whitelist` + `forbidNonWhitelisted` + `transform` | `main.ts` |
| CORS | allowlist из `CORS_ORIGIN` в production | `main.ts` |
| Upload | 4–8 MB, allowlist MIME, роли на materials/knowledge | upload-контроллеры |
| Платежи | webhook: заголовки merchant/secret; часто re-check статуса у Platega | `payments` / `platega.client` |
| SQL | TypeORM + параметризованные запросы | сервисы |

**Не реализовано (и это хорошо с точки зрения атаки):** публичный «восстановить пароль» — нет эндпоинта, нет поверхности для токен-брутфорса. Если появится — сразу с TTL + rate limit.

---

## Основные риски

### Высокий — брутфорс и захват аккаунта

1. **Нет rate limit на auth** ✅  
   `POST /auth/login`, `/auth/admin/login`, `/auth/register`, `/auth/refresh`, смена пароля — `@nestjs/throttler` (глобально 120/min, auth login/register/admin 10/min, refresh 30/min, password 5/min), IP через `X-Forwarded-For` + `trust proxy`.

2. **Нет lockout / backoff / CAPTCHA** после N неудачных попыток. ✅ (lockout)  
   In-memory lockout по phone: 5 фейлов → пауза 15 мин (`AuthAttemptService`). CAPTCHA — позже (E.4).

3. **Admin login раскрывает факт верного пароля** ✅  
   Не-сотрудник с верным паролем получает тот же `401 Invalid phone or password`, что и при неверном пароле (не `403`).

4. **Смена пароля не отзывает refresh-сессии** ✅  
   `PATCH /auth/me/password` вызывает `revokeAllRefreshTokens`; фронт сбрасывает сессию и ведёт на `/login`.

### Высокий / средний — злоупотребление API

5. Нет лимитов на `POST /payments/create`, публичные тикеты, webhook ✅  
   - create: 5/min на `userId`  
   - публичные тикеты: 5/min IP + 5/час на phone (`TicketRateService`)  
   - webhook Platega: 60/min (мягкий, под ретраи)

6. **Reuse detection refresh** ✅  
   Повтор отозванного refresh → `revokeAllRefreshTokens(userId)` + 401. UNIQUE на `token_hash` (миграция `014`).

7. **Перечисление телефонов** ✅ (частично)  
   Login: dummy `argon2.verify` (A.5). Register: всегда `argon2.hash` до ответа (выравнивание timing). `409` при занятом phone оставлен для UX; enumeration по статусу смягчается rate limit на register.

### Средний — hardening

8. Нет **Helmet** (security headers) на Nest ✅ — `helmet` в `main.ts`.

9. Upload доверяет клиентскому `mimetype`, без magic-bytes ✅ — `detectImageFromBuffer` + расширение/MIME с диска.

10. Сравнение секрета webhook через `===`, не `timingSafeEqual` ✅ — `safeEqualString` в `platega.client`.

11. В nginx только `client_max_body_size`, **нет** `limit_req` / `limit_conn` ✅ (в репо) — зоны `mbh_auth` / `mbh_api` + `limit_conn` в `deploy/nginx/mindbodyhub.pro.conf` (нужен деплой на сервер).

### Средний / низкий — секреты и ops

12. Нет актуального `.env.example` ✅ — `mindbodyhub-back/.env.example` (+ front/admin).

13. Дефолты БД/MinIO в коде при пустом env — опасно при кривой конфигурации prod. ✅ mitigated: `assertProductionSecrets` в production.

14. `JWT_REFRESH_SECRET` в env не используется (refresh не JWT) ✅ — убран из шаблона, зафиксировано в runbook / README.

15. `ADMIN_PASSWORD` может жить в prod `.env` после seed ✅ — runbook §1 + warn в `AdminSeedService` при старте в production.

---

## План работ

### Фаза A — Антибрутфорс (P0) 🔴

**Цель:** нельзя бесконечно гонять login/register/refresh.

| # | Задача | Где | Результат | Статус |
|---|--------|-----|-----------|--------|
| A.1 | `@nestjs/throttler` глобально + жёстче на `/auth/*` | Nest | 429 при превышении | ✅ |
| A.2 | Лимит **по IP и по phone** (ключ в storage: redis или in-memory на старте) | auth | Сложнее обойти сменой IP | ✅ (IP=throttler, phone=lockout in-memory) |
| A.3 | nginx `limit_req_zone` на `location` API, особенно `/auth/` | `deploy/nginx` | Defense in depth | ✅ (конфиг; выкат на сервер) |
| A.4 | Унифицировать ответы `admin/login`: всегда `401` с общей фразой при «нельзя войти» (неверный пароль **или** нет роли панели) | `auth.service` | Нет oracle «пароль верный» | ✅ |
| A.5 | Constant-time путь логина: всегда `argon2.verify` (dummy-hash, если пользователя нет) | `auth.service` | Меньше timing enumeration | ✅ |

**Оценка:** 1–2 дня.  
**Критерий готовности:** с одного IP нельзя сделать сотни login/min; admin login не отличает «неверный пароль» от «не сотрудник» по коду/тексту так, чтобы это было полезно атакующему.

**Опционально сразу или следом:** простой lockout (N фейлов → пауза 15 мин на phone) в Redis/таблице `auth_login_attempts`. ✅ сделано in-memory (`AuthAttemptService`); Redis — при горизонтальном масштабе.

---

### Фаза B — Сессии (P1) 🟠

| # | Задача | Результат | Статус |
|---|--------|-----------|--------|
| B.1 | После смены пароля — `revokeAllRefreshTokens(userId)` (+ опционально выдать только новую пару) | Украденный refresh умирает | ✅ |
| B.2 | Reuse отозванного refresh → revoke **всех** токенов пользователя (или token family) | Защита от кражи при race | ✅ |
| B.3 | UNIQUE на `refresh_tokens.token_hash` | Целостность | ✅ (`014_refresh_token_hash_unique.sql`) |

**Оценка:** 0.5–1 день.

---

### Фаза C — Abuse других эндпоинтов (P1–P2) 🟠

| # | Задача | Результат | Статус |
|---|--------|-----------|--------|
| C.1 | Throttle `POST /payments/create` (на userId) | Меньше спама оплат | ✅ |
| C.2 | Throttle публичные `POST /tickets` (IP + phone) | Антиспам заявок | ✅ |
| C.3 | Throttle webhook Platega (мягкий, чтобы не ломать ретраи) | DoS-устойчивость | ✅ |
| C.4 | Magic-byte проверка upload + нормализация расширения | Меньше подмены MIME | ✅ |

**Оценка:** 1–2 дня.

---

### Фаза D — Базовый hardening (P2) ✅

| # | Задача | Результат | Статус |
|---|--------|-----------|--------|
| D.1 | `helmet` в `main.ts` | Security headers | ✅ |
| D.2 | `timingSafeEqual` для webhook secrets | Без timing leak | ✅ |
| D.3 | Fail-fast в production, если нет сильных `JWT_ACCESS_SECRET` / DB / storage secrets | Нет старта с дефолтами | ✅ |
| D.4 | `.env.example` без секретов; убрать/документировать `JWT_REFRESH_SECRET` | Понятный ops | ✅ |
| D.5 | После seed админа — не требовать `ADMIN_PASSWORD` в постоянном env (runbook) | Меньше секретов в конфиге | ✅ |

**Оценка:** 0.5–1 день.

---

### Фаза E — Процессы и наблюдаемость (P3) 🟢

| # | Задача | Результат | Статус |
|---|--------|-----------|--------|
| E.1 | Метрики/алерты: 429 на `/auth`, всплески 401 login | Видно атаку | ⬜ |
| E.2 | Runbook: ротация JWT/DB/MinIO/Platega secrets | Операционка | ✅ `docs/security-runbook.md` |
| E.3 | Если появится «восстановить пароль» — одноразовый токен, TTL, rate limit с первого дня | Без новой дыры | ⬜ |
| E.4 | CAPTCHA (Turnstile/hCaptcha) на login/register при аномалии — по необходимости | После A–B | ⬜ |

---

## Рекомендуемый порядок поставки

```text
Спринт 1–2:  A + B + C.1–C.3 (готово в коде)
Спринт 3:    A.3 nginx + C.4 + D.1–D.5 + E.2 (готово; nginx — после reload на сервере)
Потом:       E.1 / E.3–E.4 (метрики, reset password, CAPTCHA)
```

---

## Что не делать сейчас

- CSRF-токены при текущей схеме Bearer (не cookie-session) — низкий приоритет.
- Полноценный WAF / fail2ban — можно позже поверх nginx rate limit.
- Смена argon2 на bcrypt — не нужна; argon2id лучше.

---

## Критерий «достаточно защищены для текущего масштаба»

- Auth и платежные create-эндпоинты отдают 429 при переборе. ✅
- Admin login не подтверждает валидность пароля обычного пользователя отдельным кодом. ✅
- Смена пароля убивает старые refresh. ✅
- Prod не стартует с дефолтными секретами. ✅
- Helmet + nginx limit_req включены. ✅ в коде (nginx — после `nginx -t` и reload на сервере)
- Есть `.env.example` и runbook по секретам / `ADMIN_PASSWORD`. ✅

---

## Связанные документы

- `docs/payments-platega-plan.md` §12 — запланированный rate limit на create payment (пересекается с фазой C).
- `docs/security-runbook.md` — ротация секретов, admin seed, checklist после инцидента.
