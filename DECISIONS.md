# Decisions

## 2026-07-22

- **Project name:** Keep `Ledgerline` as the product label and `ledger-line` as the repository/package slug until a final brand name is chosen.
- **Implementation scope for first build:** Ship Phase 0 plus the first Phase 1 vertical slice: app shell, design system, chart of accounts/report fixtures, dashboard computed from journal entries, and a tested ledger posting engine.
- **Money representation:** Store operational amounts as integer minor units in application code. Prisma financial columns use `Decimal` to support database-side precision and reporting.
- **Inventory costing assumption:** Use weighted average costing for the first implementation because it is simpler for SMEs, less operationally fragile than FIFO during partial stock counts, and common enough for audit explanation. FIFO can be added behind a per-org inventory policy later.
- **Visual language:** Apply the "Ledger Look" through named CSS tokens, tabular mono numerals, compact tables, and a recurring double-rule divider. Avoid decorative dashboard-kit styling.
- **AI scope:** The first build includes AI Business Feed UI, deterministic fixture-backed insights, and the data/query contract. Live model calls are deferred until the ledger data layer and permissions are complete.
- **Auth provider:** Design for Supabase Auth/Auth.js compatibility, but keep auth as a boundary in this scaffold so ledger and UI work can proceed without credentials.
- **Build runner on this machine:** Keep `turbo.json` and the Turborepo workspace shape, but use npm workspace scripts as the root build runner because Turbo's native binary fails to spawn under the current Windows + Node 26.5.0 environment.
