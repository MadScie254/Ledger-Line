# Ledgerline

Enterprise-grade accounting, bookkeeping, and business operations software for East African SMEs and mid-market companies.

This repository is scaffolded as a Turborepo workspace:

- `apps/web` - Next.js 14 App Router product UI
- `apps/ledger-service` - TypeScript double-entry ledger engine
- `packages/ui` - Ledger Look design system components
- `packages/types` - shared domain types
- `packages/db` - Prisma schema and seed fixtures
- `docs` - architecture and phase planning

## Quick Start

```bash
npm install
npm run test:ledger
npm run build
npm run dev
```

## Accounting Rule Zero

Every posting path must call the ledger service. The UI never writes directly to financial tables. Journal entries are accepted only when debit minor units exactly equal credit minor units.
