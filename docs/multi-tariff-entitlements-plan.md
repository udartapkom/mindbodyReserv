# План: несколько тарифов у одного пользователя

## Цель

Пользователь может **купить и держать одновременно** несколько платных полок (trial / popular / vip), не теряя доступ к уже купленной при покупке другой.

Контент полок по-прежнему **не пересекается** (exact match): vip не открывает popular.

---

## Текущее состояние

| Что | Как сейчас |
|-----|------------|
| Хранение | Один `users.tariff` + один `users.tariff_expires_at` |
| Покупка другого тарифа | **Перезапись** предыдущего (`PaymentsService.markPaid`) |
| Продление того же | Продлевает `tariffExpiresAt` от текущей даты окончания |
| Доступ к материалам | Exact match: видна только своя платная полка + free/registered |
| UI прайса | «Активен» на текущем типе; остальные карточки ведут к overwrite |
| Сброс | Cron 03:00 UTC + lazy `ensureTariffNotExpired` при JWT/логине |

Ключевые файлы:

- `mindbodyhub-back/src/users/entities/user.entity.ts`
- `mindbodyhub-back/src/common/tariff/access.types.ts`
- `mindbodyhub-back/src/payments/payments.service.ts`
- `mindbodyhub-front/src/utils/materialAccess.ts`
- `mindbodyhub-front/src/app/(cabinet)/cabinet/materials/MaterialsHubContent.tsx`
- `mindbodyhub-front/src/components/PriceCard/PriceCard.tsx`

---

## Этап 0. Решения (до кода)

**Выбранный подход: multi-entitlement (несколько владений полками).**

- Не делать лесенку (vip ≠ всё ниже) — ломает продуктовую модель полок.
- Не ограничиться только бандлом «всё сразу» — не закрывает «доку́пил вторую полку позже».
- Бандл можно добавить позже поверх entitlements (один платёж → N строк).

**Кэш на `users`:**

- На переходный период оставить `users.tariff` / `tariffExpiresAt` как **derived cache** (для JWT, UserBar, админки).
- Источник правды — таблица entitlements.
- Правило кэша (черновик): «самый «высокий» активный по порядку vip > popular > trial»; дата — `expires_at` этой строки. Если активных нет → `free` / `null`.

**Цитаты:** доступны, если есть **хотя бы один** активный платный entitlement (как сейчас «любой paid»).

---

## Этап 1. Модель данных + миграция

### Таблица `user_tariff_entitlements`

| Поле | Тип | Заметки |
|------|-----|---------|
| `id` | uuid PK | |
| `user_id` | uuid FK → users | ON DELETE CASCADE |
| `tariff_type` | text/enum | `trial` \| `popular` \| `vip` |
| `expires_at` | timestamptz NOT NULL | |
| `source_payment_id` | uuid NULL FK → payments | для refund |
| `created_at` / `updated_at` | timestamptz | |
| UNIQUE | `(user_id, tariff_type)` | одна строка на полку; продление обновляет `expires_at` |

Миграция SQL: `deploy/migrations/0xx_user_tariff_entitlements.sql`.

### Backfill

Для каждого пользователя с `tariff IN (trial, popular, vip)`:

- если `tariff_expires_at` задан и в будущем → создать entitlement;
- если `tariff_expires_at` NULL (бессрочный, часто админы) → entitlement с далёким `expires_at` **или** отдельный флаг `expires_at NULL = lifetime` (решить на этапе 0: предпочесть явную дату / `NULL` = бессрочно);
- если дата в прошлом — не создавать (или сразу считать free).

### Сервис

`UserTariffEntitlementsService`:

- `listActive(userId)` → типы с `expires_at > now()` (и lifetime)
- `upsertFromPayment(userId, tariffType, expiresAt, paymentId)`
- `revokeByPayment(paymentId)` / `revoke(userId, tariffType)`
- `recomputeUserCache(userId)` → обновить `users.tariff` + `tariffExpiresAt`
- `expireOverdue()` → удалить/пометить просроченные + recompute

Критерий готовности: backfill на staging/local; unit-тесты upsert/extend/revoke.

---

## Этап 2. Платежи и сброс

### `markPaid`

1. Посчитать `expiresAt` **для этой полки** (если уже есть активный entitlement того же типа — продлить от его `expires_at`, иначе `now + durationDays`).
2. `upsert` entitlement.
3. `recomputeUserCache`.
4. **Не** затирать другие полки.

### Refund / chargeback

- Снять/укоротить entitlement, связанный с `source_payment_id` (или тип платежа, если id не записан у старых).
- `recomputeUserCache` — другие полки остаются.

### Cron + lazy expiry

- Cron: `expireOverdue` по entitlements, затем cache.
- Lazy: при JWT / login / `getProfile` — expire просроченные entitlements пользователя + cache (расширить текущий `ensureTariffNotExpired`).

Критерий: купить popular, затем trial → в БД две строки; refund trial → popular на месте.

---

## Этап 3. Access layer

### Backend `access.types.ts`

- `getAccessibleTariffTypes({ isAuthenticated, ownedPaidTypes: string[] })`  
  → `free` + (`registered` если auth) + **все** `ownedPaidTypes`.
- `canAccessMaterialShelf(shelf, { ownedPaidTypes })` → exact: полка в owned **или** free/registered по правилам.
- Quotes: `ownedPaidTypes.length > 0` (или staff).

Контроллеры materials / quotes / JWT: передавать `listActive(userId)`, не один `user.tariff`.

### Frontend `materialAccess.ts`

- `canAccessMaterialShelf(shelf, ownedPaidTypes | userTariff…)` — перейти на массив владений из профиля.
- Хаб материалов: открыты все полки из entitlements.

### API профиля

`GET /auth/me` (и login response): добавить

```ts
entitlements: { tariffType: string; expiresAt: string }[]
```

Кэш `tariff` / `tariffExpiresAt` оставить для совместимости.

Критерий: пользователь с trial+vip видит обе полки в кабинете; popular закрыта.

---

## Этап 4. UI прайса и кабинета

### Прайс (`PriceCard`)

- На активной полке: «Активен» + «Продлить до …» (покупка того же типа разрешена как extend).
- На другой полке: обычная «Купить» — **не** предупреждение о замене тарифа (или мягкий текст: «добавить доступ к этой полке»).
- Убрать логику «покупка = смена единственного тарифа».

### Кабинет

- Materials hub: карточки открыты по entitlements.
- UserBar / профиль: список полок и дат (не один бейдж), например «VIP до … · Пробный до …».

### Админка Users

- Просмотр/редактирование entitlements (добавить полку, дату, удалить).
- Поля `tariff` / `tariffExpiresAt` — read-only кэш или синхронизация через recompute после правок entitlements.

Критерий: ручной сценарий «две покупки подряд разных типов» на staging без потери первой полки.

---

## Этап 5 (опционально). Бандлы

- SKU в каталоге тарифов или отдельная сущность `bundle → [trial, popular, vip]`.
- Один `markPaid` / webhook создаёт несколько upsert entitlement.
- Отдельная карточка на прайсе «Все полки».

Вне MVP multi-buy «по одной полке».

---

## Порядок PR

1. **PR1** — миграция + entity + service + backfill + recompute cache.  
2. **PR2** — payments grant/refund + cron/lazy expiry.  
3. **PR3** — access helpers + materials/quotes + `entitlements` в `/me`.  
4. **PR4** — front: прайс, хаб, UserBar/профиль.  
5. **PR5** — admin entitlements UI.  
6. **PR6 (later)** — бандлы.

---

## Оценка объёма

| Блок | Сложность |
|------|-----------|
| Модель + backfill + cache | M |
| Платежи / refund / expiry | M |
| Access + API профиля | S–M |
| Front прайс + кабинет | M |
| Admin | S–M |
| Бандлы | S (после базы) |

---

## Вне скоупа

- Лесенка доступа (vip открывает popular/trial).
- Смена ценообразования / скидки «за вторую полку» (можно отдельно).
- Мгновенное удаление полей `users.tariff` (только после стабилизации).

---

## Риски и открытые вопросы

1. **Бессрочный VIP без даты** (админы на проде) — в entitlements: `expires_at NULL` = lifetime или явная дата «9999»?  
2. **Отображение «главного» тарифа** в JWT/бейдже при нескольких полках — какой приоритет?  
3. **Старые платежи без привязки entitlement** — refund по `tariff_type` + эвристика, если `source_payment_id` пуст.  
4. Нужна ли скидка/бандл в первой поставке или только раздельные покупки?
