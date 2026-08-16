# Calendar Booking Service

### Hexlet tests and linter status:
[![Actions Status](https://github.com/MyLittleCoin/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/MyLittleCoin/ai-for-developers-project-386/actions)

Сервис бронирования календаря. В репозитории есть TypeSpec-контракт API
(`main.tsp`) и фронтенд (`web/`) на Vite + React + TypeScript + shadcn/ui.

## Разработка

Подготовка типов из контракта и мок-сервер:

```bash
npm run gen:types       # сгенерировать dist/openapi.yaml и web/src/lib/schema.ts
npm run dev:mock        # Prism-мок контракта на http://localhost:4010
```

Фронтенд (второй терминал):

```bash
npm run dev:front       # Vite dev-сервер на http://localhost:5173
```

Vite dev-сервер проксирует `/api/v1` на Prism-мок, поэтому API в браузере
отвечает по данным контракта без реального бэкенда.

Тесты и сборка:

```bash
npm --prefix web run test    # Vitest
npm --prefix web run build   # TypeScript + Vite build
```

## API

Контракт описан в `main.tsp` (TypeSpec). Открытая спецификация генерируется
в `dist/openapi.yaml`:

```bash
npm run gen
```

- **Гость**: `GET /event-types`, `GET /event-types/{id}/slots`, `POST /bookings`
- **Админ** (без авторизации): `GET /admin/event-types`, `POST /admin/event-types`,
  `GET /admin/event-types/{id}`, `GET /admin/bookings`
