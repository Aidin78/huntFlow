# huntFlow

Web app for managing and tracking job applications.

## Tech

- Frontend: Next.js (`web/`)
- Backend: Express + Node.js (`api/`)
- Database: PostgreSQL (`docker-compose.yml`)
- ORM: Prisma (`packages/db/`)

## Getting started

1) Create env file:

```bash
copy .env.example .env
```

2) Make Prisma pick up `DATABASE_URL`:

```bash
copy .env packages\\db\\.env
```

3) Start Postgres:

```bash
docker compose up -d
```

4) Install dependencies (root + workspaces):

```bash
npm install
```

5) Create DB schema:

```bash
npm run db:migrate
npm run db:generate
```

6) Run API:

```bash
npm run dev:api
```

Health check: `http://localhost:4000/health`

7) Run Web:

```bash
npm run dev:web
```

