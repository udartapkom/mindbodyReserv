# План: ярлык на экран и Web Push

## Цель

1. Пользователь может поставить ярлык MindBodyHub на экран телефона.
2. После согласия получает push: ответ поддержки, новые материалы, (опционально) цитата дня.

**Текущее состояние:** есть `site.webmanifest` и иконки, service worker и Web Push отсутствуют. Уведомления на бэке — только VK админам (`VkNotifyService`).

---

## Этап 0. Решения (до кода)

- **MVP-события:** только ответ техподдержки (`TicketsService.addAdminMessage`) — сейчас пользователь не получает ничего.
- **Вторая очередь:** публикация материала (`MaterialsService.publish`).
- **Позже / осторожно:** цитата дня (cron или при `publish`) — риск отписок.
- **Провайдер:** свой Web Push (VAPID + `web-push` на Nest), без Firebase на первом шаге.
- **Где просить разрешение:** кабинет (Popup + ErrorPopup), не на лендинге; на iOS — только в standalone после ярлыка.

---

## Этап 1. PWA / ярлык

### Манифест (`public/site.webmanifest`)

- `start_url: "/cabinet"` (или `/` + редирект)
- `scope`, `id`, `display: "standalone"`
- проверка иконок 192/512 + `apple-touch-icon` (уже есть)
- опционально `purpose: "any maskable"` для Android

### Service Worker (минимум для install)

- регистрация SW из клиента (layout / отдельный `PwaRegister`)
- cache strategy простая (network-first для HTML, cache для статики) — без офлайн-кабинета на MVP

### UX «Добавить на экран»

- Android: `beforeinstallprompt` → кнопка в профиле / кабинете
- iOS: инструкция Share → «На экран „Домой“» (детект `standalone` / iOS)
- не показывать install UI, если уже установлено

### Критерий готовности

На Android и iOS появляется иконка, открытие в standalone без адресной строки.

### Статус

**Сделано:** манифест (`start_url`, `scope`, `id`), `public/sw.js`, `PwaRegister`, блок «Ярлык на экран» в профиле (Android `beforeinstallprompt` + инструкция для iOS).

---

## Этап 2. Подписки на push (бэкенд)

### Модель `PushSubscription`

- `id`, `userId`, `endpoint`, `p256dh`, `auth`, `userAgent`, `createdAt`, `updatedAt`
- уникальность по `endpoint`; один user — несколько устройств

### API (JWT)

- `POST /push/subscribe` — сохранить/обновить подписку
- `DELETE /push/subscribe` — отписаться (по endpoint)
- опционально `GET /push/status` — есть ли активные подписки

### Сервис отправки

- VAPID keys в env (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`)
- `PushNotifyService.sendToUser(userId, payload)` через `web-push`
- при `410/404` — удалять мёртвую подписку

### Модуль

Расширить `NotificationsModule` или отдельный `PushModule`, рядом с `VkNotifyService`.

### Статус

**Сделано:** entity + миграция `013_push_subscriptions.sql`, `PushNotifyService`, `POST/DELETE /push/subscribe`, `GET /push/status`, `GET /push/vapid-public-key`.

---

## Этап 3. Клиент push

- SW: обработчики `push` + `notificationclick` (открытие deep link: `/cabinet/support`, `/cabinet/materials/...`)
- клиент: `pushManager.subscribe` с публичным VAPID
- отправка подписки на API после логина
- UI согласия: Popup в кабинете («Уведомления о ответах поддержки»)
- iOS: показывать CTA только если `display-mode: standalone` (или аналог), иначе — сначала «добавьте на экран»
- настройки в профиле: вкл/выкл + статус разрешения ОС

### Статус

**Сделано:** SW push handlers, `PwaPushCard` + `PwaPushSync`, API-клиент `pushApi`.

---

## Этап 4. Триггеры событий

| Приоритет | Событие | Хук | Payload (пример) |
|-----------|---------|-----|------------------|
| P0 | Ответ поддержки | `TicketsService.addAdminMessage` | title, body, `url: /cabinet/support?...` |
| P1 | Новый материал | `MaterialsService.publish` | title материала, url карточки |
| P2 | Цитата дня | cron 09:00 МСК или `QuotesService.publish` | короткий текст + `/cabinet` |
| P2 | Окончание тарифа | cron 10:00 МСК (`TariffExpiryPushCronService`) | за 3/1/0 дней, `url: /price` |
| Later | Оплата | рядом с текущим VK | по желанию |

### Правила

- слать только залогиненным подписчикам;
- материалы — с учётом тарифа/доступа (как на сайте);
- цитаты — отдельный флаг предпочтений, не по умолчанию вместе с support.

### Статус

**Сделано:** P0 support reply, P1 material publish (только при переходе draft→published, аудитория по `isMaterialAccessible`), P2 cron quote `0 6 * * *` UTC (= 09:00 МСК), P2 tariff expiry `0 7 * * *` UTC (= 10:00 МСК) с дедупом.

---

## Этап 5. Предпочтения пользователя (желательно сразу)

В профиле / `User` или отдельной таблице:

- `notifySupportReplies: true` (default on при подписке)
- `notifyNewMaterials: false|true`
- `notifyDailyQuote: false`
- `notifyTariffExpiry: true` (default on)

Без этого цитаты и материалы лучше не включать в MVP.

### Статус

**Сделано:** колонки на `users`, PATCH `/auth/me`, чекбоксы в профиле (включая окончание тарифа).

---

## Этап 6. Тесты и выкладка

- Локально: HTTPS (или tunnel) — push без HTTPS не работает.
- Android Chrome: install + subscribe + push с бэка.
- iOS Safari 16.4+: ярлык → открыть с иконки → разрешение → push.
- Регресс: VK-админские уведомления не ломаются.
- Секреты VAPID в prod/staging env, ротация ключей = переподписка всех.

### Статус

**Выложено на прод (2026-07-29):** миграция `013`, VAPID в `/opt/mindbodyhub/back/.env`, деплой API/front/admin. Проверка вручную: профиль → уведомления / ярлык на телефоне.

---

## Порядок веток / PR

1. **PR1 — PWA install:** манифест, SW-заготовка, UI «на экран», без push.
2. **PR2 — Push infra:** entity + API + VAPID + клиентская подписка + SW push handler.
3. **PR3 — Support replies:** хук в `addAdminMessage` + deep link в тикет.
4. **PR4 — Materials (+ prefs):** publish + настройки в профиле.
5. **PR5 (опционально) — Quote of day.**

---

## Оценка объёма (ориентир)

| Блок | Сложность |
|------|-----------|
| Ярлык + манифест + SW + install UI | S–M |
| Подписки + отправка | M |
| Support push | S (после infra) |
| Materials + prefs | M |
| Quote cron | S–M |

---

## Вне скоупа MVP

- Нативное приложение / Store
- Rich actions на iOS (почти не поддерживаются)
- Silent push
- Замена VK-админки на push (оставить оба канала)

---

## Контекст по коду

| Область | Пути |
|---------|------|
| Манифест / иконки | `mindbodyhub-front/public/site.webmanifest`, `public/icons/` |
| Layout metadata | `mindbodyhub-front/src/app/layout.tsx` |
| Auth / `user.id` | `AuthContext`, JWT `sub` |
| UI Popup / Toast | `Popup`, `ErrorPopup`, `Toast` |
| Ответ поддержки | `TicketsService.addAdminMessage` |
| Публикация материала | `MaterialsService.publish` |
| Цитата дня | `QuotesService.findToday` / `publish` |
| VK-уведомления админам | `NotificationsModule` / `VkNotifyService` |

---

## Итоги

### Что сделано

- Ярлык на экран (манифест, SW, UI в профиле) — на проде.
- Web Push: подписки, prefs, триггеры (support / материалы / цитата дня) — на проде.
- VAPID и миграция `013` на сервере применены.

### FAQ: предупреждения Android (Transsion / Tecno / Infinix)

**Вопрос.** При установке ярлыка на Android появляются предупреждения вроде:

1. «Источник установки не подтверждает соответствие проверки качества… Transsion…»
2. «Обнаружены чувствительные разрешения: Уведомления»

Не отпугнёт ли это пользователей? Что делать?

**Ответ.**

- Это **не баг MindBodyHub** и не признак вредоносности сайта. Так часто ведут себя оболочки **Transsion** (Tecno, Infinix, itel): их аудит не доверяет установке **не из магазина приложений**. Ярлык PWA ставится из браузера → для них это «неизвестный источник».
- Второе предупреждение — обычная реакция ОС на разрешение **уведомлений** (Web Push).
- На многих других Android (Samsung, Pixel и т.п.) таких экранов часто **нет**.
- **Полностью убрать** их кодом сайта нельзя. Единственный системный способ — нативное приложение в Play/RuStore (вне скоупа PWA).
- **Что можно сделать с нашей стороны:**
  - не смешивать шаги: сначала ярлык, потом отдельно «Включить уведомления» (так и задумано);
  - добавить короткую подсказку в UI для Android: предупреждение телефона нормально для ярлыка сайта;
  - не давить на push (материалы/цитата по умолчанию выкл.).
- Отказ пользователя от уведомлений в диалоге ОС не мешает пользоваться ярлыком; просто push не придут.
