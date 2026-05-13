# Agent guidance (huntFlow)

## Project goal

Build a complete web application for users to manage and track job applications.

## Tech decisions

- Frontend: Next.js (App Router) in `web/`
- Backend: Node.js + Express in `api/`
- DB: PostgreSQL via `docker-compose.yml`
- ORM: Prisma in `packages/db/`

## Development workflow

- Use npm workspaces from repo root.
- Prefer adding shared code in `packages/*` rather than copy-pasting between `web/` and `api/`.
- Keep `.env` local; update `.env.example` when new variables are needed.

## Networking caveat (Windows)

If Prisma client generation or Docker pulls fail, it’s usually because the machine cannot reach:

- Docker Hub for `postgres:16`
- Prisma binary CDN for engine downloads

Fix by configuring proxy/VPN or corporate network settings; then rerun:

```bash
docker compose up -d
npm run db:generate
```

