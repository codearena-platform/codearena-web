# CodeArena Web

[![CI](https://github.com/wendelmax/ezship/actions/workflows/ci.yml/badge.svg)](https://github.com/wendelmax/ezship/actions/workflows/ci.yml)
[![Release](https://github.com/wendelmax/ezship/actions/workflows/release.yml/badge.svg)](https://github.com/wendelmax/ezship/actions/workflows/release.yml)

## Structure

- `codearena-arena-studio` – Arena designer (obstacles, JSON export/import)
- `codearena-bot-studio` – Blockly editor + live 3D preview
- `codearena-dashboard` – Command panel with 2D canvas
- `codearena-ui` – Shared theme and components (Nav)

## Development

```bash
npm install
```

### Run an app

```bash
npm run dev:dashboard   # localhost:3000
npm run dev:arena       # localhost:3001
npm run dev:bot         # localhost:3002
```

### Run all

```bash
npm run dev:all
```

## Production Build

```bash
npm run build
```

## Environment Variables

Copy `.env.example` to `.env.local` in each app:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_WS_URL` | WebSocket base URL (gateway) | ws://localhost:8080 |
| `NEXT_PUBLIC_MATCH_ID` | Demo match ID | demo-match-001 |
| `NEXT_PUBLIC_DASHBOARD_WS_URL` | Dashboard stream URL | ws://localhost:8080/ws |
| `NEXT_PUBLIC_ARENA_URL` | Arena Studio URL (dev: http://localhost:3001) | /arena |
| `NEXT_PUBLIC_BOT_URL` | Bot Studio URL (dev: http://localhost:3002) | /bot |
| `NEXT_PUBLIC_DASHBOARD_URL` | Dashboard URL | /dashboard |
| `NEXT_PUBLIC_BASE_PATH` | Base path in production (e.g., /arena) | '' |

### Deploy with reverse proxy

With Nginx/Caddy serving all under one domain:

- Arena: `basePath: /arena`
- Bot: `basePath: /bot`
- Dashboard: root (/) + /dashboard

Set `NEXT_PUBLIC_BASE_PATH` per app and use `NEXT_PUBLIC_PLATFORM_URL` for relative links.
