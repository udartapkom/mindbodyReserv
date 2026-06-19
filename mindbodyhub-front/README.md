# MindBodyHub — frontend

Публичный сайт на Next.js (TypeScript, App Router, SCSS modules).

## Запуск

```bash
cd mindbodyhub-front
npm install
npm run dev
```

Приложение: [http://localhost:3000](http://localhost:3000)
Если в браузере ошибка: [http://localhost:3001](http://localhost:3001)
## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск production |
| `npm run lint` | ESLint |

## Структура

- `src/app/` — страницы и layout (стили в `*.module.scss`)
- `src/global/` — глобальные стили
- `src/styles/` — SCSS-переменные и mixins
- `public/icons/` — локальные SVG (логотип `brain.svg`)
- `src/shared/ui/Icon/` — Font Awesome иконки (локально через npm)
- `src/shared/config/fontawesome.ts` — регистрация иконок

## Иконки и favicon

| Файл | Назначение |
|------|------------|
| `public/icons/favicon.ico` | вкладка браузера |
| `public/icons/brain.svg` | SVG-логотип |
| `public/icons/apple-touch-icon.png` | iOS / «Добавить на экран» |
| `public/icons/og-image.png` | превью ссылок (Telegram, VK и др.) |
| `public/site.webmanifest` | PWA-иконки |

Для корректных абсолютных URL в Open Graph домен:

```bash
NEXT_PUBLIC_SITE_URL=https://mindbodyhub.pro
```

Логотип в UI:

```tsx
<img src="/icons/brain.svg" alt="MindBodyHub" width={32} height={32} />
```

Font Awesome (все иконки из legacy, без CDN):

```tsx
import { Icon } from "@/shared/ui/Icon";

<Icon name="check" />
<Icon name="telegram" variant="brand" />
<Icon name="circle-question" variant="regular" />
```