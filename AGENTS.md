# AGENTS.md

Calendar booking service (Cal.com-like). Three parts: the API **contract** at the repo root (TypeSpec → OpenAPI), the **backend** in `server/` (Fastify + TS, in-memory storage), and the **frontend** in `web/` (Vite + React + TS + shadcn/ui).

## Backend

- Implemented in `server/` (Fastify 5, TypeScript ESM, Vitest + supertest). In-memory `Store` (data resets on restart). Runs on :4011 by default (`PORT` env).
- The source of truth for the API is `main.tsp`. The backend implements the routes/operations and error shapes defined there (`/api/v1/...`, `EventType`, `Slot`, `Booking`, `BadRequestError`/`NotFoundError`/`ConflictError`). Keep `server/src/routes/*` and `errors.ts` in sync with `main.tsp`.
- Contract behavior the backend must match (from `main.tsp`):
  - Slots: computed, not stored — 30-min step (grid anchored at the next 30-min boundary ≥ `from`), 24/7, free if `[startAt, endAt)` overlaps no booking of any event type.
  - Booking window: 14 days from current date (`bookingWindowDays`); `startAt` outside it → 400 (`bad_request`), not in the 30-min grid → 400, empty `guestName` → 400.
  - Create booking: `POST /bookings` → 201 body `Booking`, 400 invalid/out-of-window, 404 event type missing, 409 busy slot (`slot_conflict`).
  - No auth anywhere (preset owner; admin surface is `/admin/...`).
- If `main.tsp` changes: run `npm run gen` if needed, keep `web/src/lib/schema.ts` in sync via `npm run gen:types`, update `server/src/types.ts` + route/error shapes to match, and update `web/src/lib/errors.ts` mappings only if new error codes appear.

## Commands

Root scripts (`package.json`):
- `npm run gen` — compile `main.tsp` → `dist/openapi.yaml`
- `npm run gen:types` — `gen` then `openapi-typescript` → `web/src/lib/schema.ts` (**committed**; run after touching `main.tsp`, never hand-edit)
- `npm run dev:backend` — Fastify backend via `tsx watch` on :4011 (`PORT` env)
- `npm run dev:front` — Vite dev server on :5173
- `npm run dev` — both (backend + frontend) via `concurrently`
- `npm run dev:mock` — Prism mocks against `dist/openapi.yaml` on :4010 (needs `npm run gen` first; contract smoke-testing only)

All backend scripts live in **`server/`**, run from root as `npm --prefix server run <script>`:
- `test` — Vitest (`npx vitest run <file>` for a single file; integration tests use supertest against `buildApp()`, no live port)
- `build` — `tsc --noEmit` (typecheck)
- `lint` — oxlint

All frontend scripts live in **`web/`**, run from root as `npm --prefix web run <script>` (or `cd web`):
- `test` — Vitest (`npx vitest run <file>` for a single file; UI tests use jsdom + globals)
- `build` — `tsc -b` (typecheck) then `vite build`
- `lint` — oxlint (warnings from shadcn-generated ui components are expected/non-blocking)

## Dev workflow quirks

- Requires **two processes**: backend + Vite. Vite's dev proxy forwards `/api` to the backend (:4011, override with `VITE_PROXY_TARGET`) keeping the full `/api/v1/...` path — the backend serves paths exactly as declared in `main.tsp`. Prism served spec-relative paths; if you switch the proxy back to Prism you must restore the `/api/v1` → `""` rewrite.
- API client base URL (`web/src/lib/client.ts`) is `import.meta.env.VITE_API_BASE_URL ?? "/api/v1"`.
- Tests mock the whole `@/lib/api` module with `vi.mock("@/lib/api", ...)` (no MSW, no real fetch). Sonner tests additionally mock `next-themes`. `SlotFlow`/409 fixtures must generate slot times relative to today (SlotPicker defaults to `dayWindow()[0]`).
- Type imports: `web/src/lib/schema.ts` only exports `paths`/`components` (no top-level entity types). Import types from `@/lib/api` (re-exports `EventType`, `Slot`, `Booking`, …), not from `@/lib/schema`.

## Architecture notes

- Routes (`web/src/App.tsx`): guest `/`, `/book/:eventTypeId`, `/book/:id/success`; admin `/admin` → `event-types`, `event-types/:eventTypeId`, `bookings` (no auth anywhere).
- Data: TanStack Query; slot queries invalidated after booking/409; admin lists after create. Errors normalized to `ApiError` → Russian messages in `web/src/lib/errors.ts`.
- Times are UTC on the wire, displayed in browser-local tz (date-fns helpers in `web/src/lib/dates.ts`).
- The contract has **no** update/delete for event types and no booking cancellation — do not add UI relying on them.
- `opencode.json` is gitignored (contains local MCP config incl. shadcn MCP).
- Global git config rewrites `ssh://git@github.com/` → `https://github.com/`; the remote is HTTPS with no stored credential — pushes need a one-off token in the push URL (never persist it into `.git/config`).
