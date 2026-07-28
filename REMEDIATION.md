# Phase 0.5 Remediation

This checklist tracks the migration from fixture-backed module shells to persisted, ledger-safe workflows.

## Cloudflare Readiness

- [x] Upgrade the web workspace to Next.js 15.5.22, compatible with OpenNext 1.20.2.
- [x] Add OpenNext, Wrangler, Worker configuration, local binding guidance, and static asset headers.
- [x] Add a request-scoped Prisma `@prisma/adapter-pg` client that prefers the Hyperdrive binding.
- [x] Add R2 and KV bindings to the Worker configuration.
- [ ] Replace placeholder Hyperdrive and KV IDs with provisioned Cloudflare resources before deployment.
- [ ] Add Cloudflare Queues consumers and Cron Triggers when recurring operations are implemented.

## Accounting: Chart of Accounts

- [x] Replace `/accounting/chart-of-accounts` with a dedicated live route.
- [x] Read the active organization chart through a Prisma Route Handler.
- [x] Create accounts with validation, organization scoping, and visible success/error states.
- [x] Edit accounts with a guard against changing the type of an account with posted journal lines.
- [x] Write `AuditLogEntry` records for creates and edits.
- [x] Add an in-product setup tutorial for the first custom account.
- [x] Add a Postgres-backed Route Handler integration test, enabled by `TEST_DATABASE_URL`.

## Next Vertical Slices

- [ ] Accounting: manual journal entry creation and posting through `@ledgerline/ledger-service`.
- [ ] Sales: customers, invoices, and payments received.
- [ ] Expenses & Bills: vendors, bills, expenses, approvals, and R2 receipts.
- [ ] Banking: CSV/M-Pesa import, categorization, matching, and reconciliation.
- [ ] Reports: live Trial Balance, P&L, Balance Sheet, and drill-downs.
- [ ] Team: authentication, organization membership, and permission enforcement.
