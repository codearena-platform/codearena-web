# CodeArena Web

[![CI](https://github.com/codearena-platform/codearena-web/actions/workflows/ci.yml/badge.svg)](https://github.com/codearena-platform/codearena-web/actions/workflows/ci.yml)

Monorepo for the CodeArena web clients and their shared UI package.

## Structure

- `codearena-arena-studio` – Arena designer (obstacles, JSON export/import)
- `codearena-bot-studio` – Blockly editor + live 3D preview
- `codearena-dashboard` – Command panel with 2D canvas
- `codearena-ui` – Shared theme, navigation and browser config helpers

## Requirements

Node.js 22.18+ and npm 11+. There is one root `package-lock.json`; run all
commands from the repository root and never generate per-app lockfiles.

```bash
npm ci
```

### Run an app

```bash
npm run dev:dashboard   # localhost:3000
npm run dev:arena       # localhost:3001
npm run dev:bot         # localhost:3002
```

`npm run dev:all` starts all three after building the shared UI package.

## Production build

```bash
npm run build
```

This builds `@codearena/ui` first (emitting JavaScript and `.d.ts` files into
`codearena-ui/dist`) and then each Next.js app.

## Environment variables

Copy `.env.example` to `.env.local` in each app. `NEXT_PUBLIC_*` values are
inlined at **build time**, so rebuild after changing them.

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_WS_URL` | Gateway WebSocket base URL. Use `wss://` in production. | `ws://localhost:8080` |
| `NEXT_PUBLIC_MATCH_ID` | Bot Studio match ID; URL-encoded in the stream path. | `demo-match-001` |
| `NEXT_PUBLIC_DASHBOARD_WS_URL` | Dashboard stream URL; falls back to `NEXT_PUBLIC_WS_URL` + `/ws`. | `ws://localhost:8080/ws` |
| `NEXT_PUBLIC_BASE_PATH` | App mount point behind a reverse proxy (for example `/bot`). | empty |
| `NEXT_PUBLIC_PLATFORM_URL` | Home link used by the shared `Nav`. | `/` |
| `NEXT_PUBLIC_ARENA_URL` | Arena Studio link. | `/arena` |
| `NEXT_PUBLIC_BOT_URL` | Bot Studio link. | `/bot` |
| `NEXT_PUBLIC_DASHBOARD_URL` | Dashboard link. | `/dashboard` |

`next.config` reads `NEXT_PUBLIC_BASE_PATH` for Next's own `basePath`. Internal
`next/link` targets receive that prefix automatically. Imperative URLs such as
`fetch('/api/...')` use `withBasePath()` from `@codearena/ui`, so configure the
same value for the server build and the browser bundle. The realtime client
defaults to `wss://` in production and encodes match IDs before building the
WebSocket URL.

### Deploy with a reverse proxy

With Nginx/Caddy serving all apps under one domain, set `NEXT_PUBLIC_BASE_PATH`
per app (`/arena`, `/bot`, or an empty string for the dashboard root) and use
`NEXT_PUBLIC_PLATFORM_URL` for the shared home link.

## Bot program contract

The Blockly generator and `/api/validate` use one contract:

- A program must define `onTick((bot) => { ... })` or
  `onMessage((bot, message) => { ... })`.
- Inside a handler, actions are `bot.ahead(distance)`, `bot.turn(degrees)`,
  `bot.fire(power)` and `bot.activatePower(PowerType.SHIELD | OVERCLOCK | STEALTH)`.
- Blockly actions are wrapped in `onTick` by `wrapBotActions()`; the validator
  uses the shared `analyzeBotProgram()` rules and rejects missing handlers,
  empty programs and `while(true)` loops.
- `POST /api/validate` accepts `{ code }` and returns
  `{ valid, errors, warnings, score }`, or `{ error }` with a non-2xx status.
  The editor normalises every response before rendering it.

## Validation

```bash
npm test          # unit tests (Node built-in test runner)
npm run typecheck # emits the UI package, then typechecks every workspace
npm run lint      # ESLint across all workspaces
npm run build     # production builds for every app
npm run test:e2e  # smoke tests the built apps (run after npm run build)
```

CI runs all of these on pull requests. The dashboard system/telemetry screen is
explicitly labelled demo data: no OpenTelemetry collector is connected.
