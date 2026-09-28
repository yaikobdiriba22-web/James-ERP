# PostgreSQL setup

James ERP now includes a Prisma PostgreSQL persistence layer.

## Requirements

- Node.js 18+
- PostgreSQL 14+

Create a database named `james_erp`, then copy `.env.example` to `.env` and set `DATABASE_URL`.

## Initialize the database

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

For a hosted PostgreSQL provider, use the provider's connection string instead of the local example. Never commit `.env` or production credentials.

## Available commands

- `npm run db:generate` generates the Prisma client.
- `npm run db:push` applies the Prisma schema to PostgreSQL during development.
- `npm run db:seed` initializes the ERP state from the existing demo data.
- `npm run db:studio` opens Prisma Studio.

The existing API remains compatible with the frontend while the persistence adapter is migrated route-by-route. The PostgreSQL schema stores the current ERP aggregate as JSON so no existing module data is lost during the first migration; sessions are stored in a dedicated relational table.
