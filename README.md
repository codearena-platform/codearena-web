# CodeArena Web

[![CI](https://github.com/wendelmax/ezship/actions/workflows/ci.yml/badge.svg)](https://github.com/wendelmax/ezship/actions/workflows/ci.yml)
[![Release](https://github.com/wendelmax/ezship/actions/workflows/release.yml/badge.svg)](https://github.com/wendelmax/ezship/actions/workflows/release.yml)

cd

## Estrutura

- `codearena-arena-studio` – Designer de arenas (obstáculos, export/import JSON)
- `codearena-bot-studio` – Editor Blockly + visualização 3D ao vivo
- `codearena-dashboard` – Painel de comando com canvas 2D
- `codearena-ui` – Tema e componentes compartilhados (Nav)

## Desenvolvimento

```bash
npm install
```

### Rodar um app

```bash
npm run dev:dashboard   # localhost:3000
npm run dev:arena       # localhost:3001
npm run dev:bot         # localhost:3002
```

### Rodar todos

```bash
npm run dev:all
```

## Build para produção

```bash
npm run build
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` em cada app:

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_WS_URL` | URL base WebSocket (gateway) | ws://localhost:8080 |
| `NEXT_PUBLIC_MATCH_ID` | ID da partida demo | demo-match-001 |
| `NEXT_PUBLIC_DASHBOARD_WS_URL` | URL do stream do dashboard | ws://localhost:8080/ws |
| `NEXT_PUBLIC_ARENA_URL` | URL do Arena Studio (dev: http://localhost:3001) | /arena |
| `NEXT_PUBLIC_BOT_URL` | URL do Bot Studio (dev: http://localhost:3002) | /bot |
| `NEXT_PUBLIC_DASHBOARD_URL` | URL do Dashboard | /dashboard |
| `NEXT_PUBLIC_BASE_PATH` | Base path em produção (ex: /arena) | '' |

### Deploy com reverse proxy

Com Nginx/Caddy servindo todos sob um domínio:

- Arena: `basePath: /arena`
- Bot: `basePath: /bot`
- Dashboard: raiz (/) + /dashboard

Defina `NEXT_PUBLIC_BASE_PATH` por app e use `NEXT_PUBLIC_PLATFORM_URL` para links relativos.
