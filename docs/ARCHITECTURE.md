# Ledgerline Architecture

## Architecture Restatement

Ledgerline is a multi-tenant accounting platform where every operational workflow is a posting UI over one double-entry ledger. Invoices, bills, bank matches, payroll runs, expenses, inventory adjustments, and payments all resolve to balanced `JournalEntry` records. Balances and financial reports are derived from journal lines, never from independent module totals.

The system is split into a Turborepo monorepo:

- `apps/web` is the Next.js 14 App Router interface, responsible for workflows, reporting screens, and organization-scoped navigation.
- `apps/ledger-service` owns posting validation, journal construction, reversals, trial balances, and financial calculations.
- `packages/db` owns Prisma models, migrations, and seed data for PostgreSQL.
- `packages/ui` owns the customized shadcn-style component primitives and Ledger Look tokens.
- `packages/types` defines shared domain contracts so UI, ledger service, and API layers agree.

The web app talks to server actions and route handlers. Those handlers call the ledger service for financial writes and Prisma for persistence. Background jobs handle bank/mobile-money sync, recurring invoices, payroll runs, report generation, filing reminders, and integration webhooks.

## Data Model Summary

Core tenancy starts with `Organization`, `User`, `OrgMembership`, and `Role`. Every tenant-owned table carries `orgId` for row-level security.

The ledger core is `Account`, `JournalEntry`, `JournalLine`, and `AccountingPeriod`. All financial modules reference ledger accounts and source journal entries.

Operational domains include:

- Banking: `BankConnection`, `BankTransaction`, `BankRule`
- Sales: `Customer`, `Product`, `Invoice`, `InvoiceLine`, `Estimate`, `EstimateLine`, `SalesReceipt`, `SalesOrder`, `PaymentReceived`, `RecurringTemplate`
- Purchases: `Vendor`, `Bill`, `BillLine`, `Expense`, `PurchaseOrder`, `BillPayment`
- Tax: `TaxRate`, `TaxReturn`
- Payroll: `Employee`, `PayRun`, `Payslip`
- Projects/time: `Project`, `TimeEntry`
- Operations: `Budget`, `AuditLogEntry`, `Attachment`, `Notification`, `SavedReport`, `Integration`, `ExchangeRate`

## Module Dependency Map

1. Foundation: design system, auth boundary, org tenancy, navigation shell, database package.
2. Ledger core: chart of accounts, journal posting service, accounting periods, audit logging.
3. Sales/purchases: customers, vendors, products, invoices, payments, bills, expenses.
4. Dashboard: KPI and cash-flow reporting derived from ledger lines and open AR/AP.
5. Banking: connections, transaction feed, matching, rules, reconciliation.
6. Reports: standard statements, drill-down, exports, scheduled delivery.
7. Kenya differentiators: M-Pesa, eTIMS/KRA, WhatsApp invoicing.
8. Payroll, inventory, projects, and time.
9. AI Business Feed over verified accounting data.
10. Enterprise hardening: SSO, permissions, audit browsing, marketplace, multi-currency polish.

## Phased Build Order

Phase 0: monorepo, CI scripts, design system, app shell, route shell for every nav item.

Phase 1: chart of accounts, manual journals, posting validation, trial balance tests, accounting periods.

Phase 2: customers, products, invoices, payments, vendors, bills, expenses, and dashboard KPIs from ledger data.

Phase 3: bank/mobile-money feed, categorization, matching, rules, reconciliation.

Phase 4: reports with drill-down and PDF/XLSX/CSV exports.

Phase 5: Daraja M-Pesa, KRA eTIMS/iTax, WhatsApp invoice delivery.

Phase 6: payroll, inventory, projects, time tracking.

Phase 7: AI Business Feed, natural-language query, anomalies, forecasting, weekly digest.

Phase 8: enterprise permissions, integrations marketplace, audit log tooling, SSO/SAML, hardening.
