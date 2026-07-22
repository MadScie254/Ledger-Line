import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  FilePlus2,
  FileText,
  LockKeyhole,
  Plus,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, CurrencyAmount, DataTable, DoubleRule, EmptyState, Field, Input, Select, StatusPill } from "@ledgerline/ui";
import type { DataTableColumn } from "@ledgerline/ui";
import type { BankTransaction, InvoiceSummary } from "@ledgerline/types";
import { bankTransactions, getDashboardModel, invoices } from "@/lib/demo-data";

interface ModulePageProps {
  pathname: string;
  title: string;
}

type ModuleKind =
  | "banking"
  | "sales"
  | "expenses"
  | "accounting"
  | "reports"
  | "ai"
  | "settings"
  | "team"
  | "tax"
  | "payroll"
  | "inventory"
  | "projects"
  | "crm"
  | "integrations"
  | "generic";

export function ModulePage({ pathname, title }: ModulePageProps) {
  const kind = getModuleKind(pathname);
  const content = moduleContent[kind];
  const dashboard = getDashboardModel();

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">{content.eyebrow}</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{content.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">
              <Settings2 className="h-4 w-4" aria-hidden="true" />
              Configure
            </Button>
            <Button variant="primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {content.primaryAction}
            </Button>
          </div>
        </div>
        <DoubleRule className="mt-5" />
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {content.metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.label} className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{metric.label}</p>
                  <div className="mt-3 font-serif text-3xl font-semibold leading-none tracking-normal text-ink-900">
                    {typeof metric.value === "number" ? <CurrencyAmount amountMinor={metric.value} /> : metric.value}
                  </div>
                </div>
                <Icon className="h-5 w-5 text-slate-500" aria-hidden="true" />
              </div>
              <DoubleRule className="my-4" />
              <p className="text-xs font-semibold text-slate-500">{metric.meta}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{content.tableTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{content.tableSummary}</p>
            </div>
            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              <Input aria-label={`Search ${title}`} placeholder="Search records" className="pl-9" />
            </div>
          </div>
          <DoubleRule className="my-4" />
          {kind === "banking" ? (
            <DataTable columns={bankColumns} data={bankTransactions} getRowId={(row) => row.id} />
          ) : kind === "sales" ? (
            <DataTable columns={invoiceColumns} data={invoices} getRowId={(row) => row.id} />
          ) : kind === "accounting" ? (
            <DataTable columns={trialBalanceColumns} data={dashboard.trialBalance.slice(0, 8)} getRowId={(row) => row.account.id} />
          ) : (
            <DataTable columns={genericColumns} data={content.rows} getRowId={(row) => row.id} />
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-ledger-green-700" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-ink-900">{content.detailTitle}</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">{content.detailBody}</p>
            <DoubleRule className="my-4" />
            <div className="space-y-2">
              {content.checks.map((check) => (
                <div key={check} className="flex items-center gap-2 rounded-[6px] bg-paper-50 px-3 py-2 text-sm font-medium text-ink-900">
                  <CheckCircle2 className="h-4 w-4 text-ledger-green-700" aria-hidden="true" />
                  {check}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
            <h2 className="text-lg font-semibold text-ink-900">{content.formTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{content.formSummary}</p>
            <DoubleRule className="my-4" />
            <div className="grid gap-3">
              <Field label="Reference">
                <Input defaultValue={content.reference} />
              </Field>
              <Field label="Workflow state">
                <Select defaultValue="review">
                  <option value="draft">Draft</option>
                  <option value="review">Needs review</option>
                  <option value="approved">Approved</option>
                  <option value="posted">Posted</option>
                </Select>
              </Field>
              <Field label="Amount">
                <Input className="font-mono tabular-nums" defaultValue="KES 0.00" />
              </Field>
              <Button variant="accent" className="mt-1">
                <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                Save draft
              </Button>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <EmptyState
          icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
          title={content.emptyTitle}
          body={content.emptyBody}
          action={
            <Button variant="secondary">
              {content.emptyActionIcon}
              {content.emptyAction}
            </Button>
          }
        />
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Audit posture</h2>
              <p className="mt-1 text-sm text-slate-500">Immutable diffs and period locks are part of every financial workflow.</p>
            </div>
            <StatusPill tone="success">active</StatusPill>
          </div>
          <DoubleRule className="my-4" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[6px] bg-paper-50 p-3">
              <LockKeyhole className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-ink-900">July period open</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Backdated entries require approval after close.</p>
            </div>
            <Link href="/settings/audit-log" className="rounded-[6px] bg-paper-50 p-3 transition hover:bg-paper-100 focus-ring">
              <FileText className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-ink-900">View audit trail</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-focus-blue-500">
                Open log
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const bankColumns: DataTableColumn<BankTransaction>[] = [
  { key: "date", header: "Date", cell: (row) => <span className="font-mono text-xs tabular-nums">{row.date}</span> },
  { key: "description", header: "Description", cell: (row) => <span className="font-medium">{row.description}</span> },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    cell: (row) => <CurrencyAmount amountMinor={row.amountMinor} tone={row.direction === "in" ? "income" : "expense"} />
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusPill tone={row.status === "unreviewed" ? "warning" : "success"}>{row.status}</StatusPill>
  }
];

const invoiceColumns: DataTableColumn<InvoiceSummary>[] = [
  { key: "invoice", header: "Invoice", cell: (row) => <span className="font-mono text-xs font-semibold">{row.invoiceNo}</span> },
  { key: "customer", header: "Customer", cell: (row) => row.customerName },
  { key: "due", header: "Due", cell: (row) => <span className="font-mono text-xs tabular-nums">{row.dueDate}</span> },
  { key: "status", header: "Status", cell: (row) => <StatusPill tone={row.status === "paid" ? "success" : "warning"}>{row.status}</StatusPill> },
  { key: "balance", header: "Balance", align: "right", cell: (row) => <CurrencyAmount amountMinor={row.balanceDueMinor} /> }
];

const trialBalanceColumns: DataTableColumn<ReturnType<typeof getDashboardModel>["trialBalance"][number]>[] = [
  { key: "code", header: "Code", cell: (row) => <span className="font-mono text-xs tabular-nums">{row.account.code}</span> },
  { key: "account", header: "Account", cell: (row) => row.account.name },
  { key: "type", header: "Type", cell: (row) => <StatusPill>{row.account.type}</StatusPill> },
  { key: "debit", header: "Debit", align: "right", cell: (row) => <CurrencyAmount amountMinor={row.debitMinor} /> },
  { key: "credit", header: "Credit", align: "right", cell: (row) => <CurrencyAmount amountMinor={row.creditMinor} /> }
];

interface GenericRow {
  id: string;
  record: string;
  owner: string;
  status: string;
  amountMinor: number;
}

const genericColumns: DataTableColumn<GenericRow>[] = [
  { key: "record", header: "Record", cell: (row) => <span className="font-medium">{row.record}</span> },
  { key: "owner", header: "Owner", cell: (row) => row.owner },
  { key: "status", header: "Status", cell: (row) => <StatusPill tone={row.status === "approved" ? "success" : "warning"}>{row.status}</StatusPill> },
  { key: "amount", header: "Amount", align: "right", cell: (row) => <CurrencyAmount amountMinor={row.amountMinor} /> }
];

const moduleContent: Record<ModuleKind, {
  eyebrow: string;
  summary: string;
  primaryAction: string;
  tableTitle: string;
  tableSummary: string;
  detailTitle: string;
  detailBody: string;
  formTitle: string;
  formSummary: string;
  reference: string;
  emptyTitle: string;
  emptyBody: string;
  emptyAction: string;
  emptyActionIcon: ReactNode;
  checks: string[];
  metrics: Array<{ label: string; value: string | number; meta: string; icon: LucideIcon }>;
  rows: GenericRow[];
}> = {
  banking: {
    eyebrow: "Banking and mobile money",
    summary: "Bank accounts, M-Pesa till activity, matching, rules, and reconciliation live in one operations-grade feed.",
    primaryAction: "Connect account",
    tableTitle: "Transaction feed",
    tableSummary: "Imported movements with visible AI category suggestions and review status.",
    detailTitle: "Reconciliation guardrails",
    detailBody: "Statement balances must match cleared ledger lines before a reconciliation can be completed.",
    formTitle: "Categorization draft",
    formSummary: "Human confirmation is required before bank feed items post.",
    reference: "BANK-RULE-001",
    emptyTitle: "No unresolved reconciliation difference",
    emptyBody: "Once statement ending balance equals book balance, the close package can be locked for the period.",
    emptyAction: "Open reconcile",
    emptyActionIcon: <Banknote className="h-4 w-4" aria-hidden="true" />,
    checks: ["Debit-credit posting required", "Matched entries preserve source links", "Rules never override locked periods"],
    metrics: [
      { label: "Unreviewed", value: "1 item", meta: "Needs bookkeeper review", icon: Banknote },
      { label: "Matched this month", value: 1_821_60000, meta: "Bank plus M-Pesa", icon: CheckCircle2 },
      { label: "Sync health", value: "98%", meta: "Last sync 12 minutes ago", icon: Sparkles }
    ],
    rows: []
  },
  sales: {
    eyebrow: "Sales and get paid",
    summary: "Customers, invoices, recurring billing, payment links, M-Pesa STK push, and receipts over ledger-backed AR.",
    primaryAction: "Create invoice",
    tableTitle: "Receivables",
    tableSummary: "Invoice status and balances after posted payments.",
    detailTitle: "Payment workflow",
    detailBody: "Public payment pages support card, bank transfer, and M-Pesa STK push with webhook-driven status updates.",
    formTitle: "Invoice draft",
    formSummary: "Line totals, tax, and AR posting are calculated before send.",
    reference: "INV-1027",
    emptyTitle: "No failed payment webhooks",
    emptyBody: "Payment status changes will queue here when a provider callback needs manual review.",
    emptyAction: "Open payments",
    emptyActionIcon: <CircleDollarSign className="h-4 w-4" aria-hidden="true" />,
    checks: ["AR posts from invoice journal", "Partial payments reduce balance due", "Voids require typed confirmation"],
    metrics: [
      { label: "Open AR", value: 1_622_90000, meta: "3 active invoices", icon: ReceiptText },
      { label: "Paid MTD", value: 1_840_00000, meta: "Bank and M-Pesa", icon: CheckCircle2 },
      { label: "Overdue", value: "0", meta: "No late customer balances", icon: ShieldCheck }
    ],
    rows: []
  },
  expenses: {
    eyebrow: "Purchases and payables",
    summary: "Vendor bills, expenses, approvals, billable costs, receipt capture, and AP posting in one workflow.",
    primaryAction: "Record expense",
    tableTitle: "Payables work queue",
    tableSummary: "Bills and expenses awaiting approval, payment, or posting.",
    detailTitle: "Approval threshold",
    detailBody: "Bills above policy thresholds route to an approver before they can affect the ledger.",
    formTitle: "Expense capture",
    formSummary: "OCR suggestions stay editable and unposted until confirmed.",
    reference: "EXP-745",
    emptyTitle: "No receipts awaiting confirmation",
    emptyBody: "Uploaded receipts with OCR-extracted fields will wait here for review before journal posting.",
    emptyAction: "Upload receipt",
    emptyActionIcon: <FilePlus2 className="h-4 w-4" aria-hidden="true" />,
    checks: ["AP and expense journals balanced", "Approval diffs are audited", "Billable costs link to customers"],
    metrics: [
      { label: "Open AP", value: 450_00000, meta: "1 supplier bill", icon: FileText },
      { label: "Pending approval", value: "2", meta: "Above policy threshold", icon: ShieldCheck },
      { label: "Billable costs", value: 136_50000, meta: "Available for invoice", icon: CircleDollarSign }
    ],
    rows: sampleRows("Bill", "approved")
  },
  accounting: {
    eyebrow: "Ledger core",
    summary: "Chart of accounts, manual journal entries, period locks, reconciliations, and the sacred double-entry rule.",
    primaryAction: "Post journal",
    tableTitle: "Trial balance extract",
    tableSummary: "Rows are derived from posted journal lines and must balance exactly.",
    detailTitle: "Double-entry enforcement",
    detailBody: "The application guard and database trigger both reject unbalanced journal entries.",
    formTitle: "Manual journal draft",
    formSummary: "Debit and credit totals validate live before posting.",
    reference: "JE-2026-071",
    emptyTitle: "No period override requests",
    emptyBody: "Backdated postings after close require explicit approval and permanent audit records.",
    emptyAction: "Close books",
    emptyActionIcon: <LockKeyhole className="h-4 w-4" aria-hidden="true" />,
    checks: ["Journal lines are immutable after post", "Reversals create linked entries", "Closed periods block silent changes"],
    metrics: [
      { label: "Trial balance", value: "Clean", meta: "Debits equal credits", icon: CheckCircle2 },
      { label: "Accounts", value: "14", meta: "Active chart rows", icon: FileText },
      { label: "Locked periods", value: "6", meta: "Prior fiscal months", icon: LockKeyhole }
    ],
    rows: []
  },
  reports: baseContent("Reporting", "standard reports", "Schedule report", "Report library", "Saved financial statements, drill-downs, and exports.", "P&L-JUL-2026"),
  ai: baseContent("AI Business Feed", "embedded copilot", "Ask Ledgerline", "Insight queue", "Anomalies, category suggestions, forecasts, and plain-language financial summaries.", "AI-FEED-001"),
  settings: baseContent("Company control", "settings", "Save setting", "Configuration register", "Company, currencies, tax, templates, audit log, and billing configuration.", "SET-001"),
  team: baseContent("Access control", "team and permissions", "Invite user", "Role register", "Users, roles, accountant access, MFA posture, and SSO readiness.", "ROLE-001"),
  tax: baseContent("Tax compliance", "tax center", "Prepare return", "Filing register", "VAT, PAYE, eTIMS fiscalization, KRA bridge, and statutory deadlines.", "VAT-2026-07"),
  payroll: baseContent("Payroll operations", "payroll", "Run payroll", "Pay run register", "Employees, salary structures, payslips, PAYE, NSSF, and SHIF summaries.", "PAYRUN-2026-07"),
  inventory: baseContent("Inventory control", "stock", "Adjust stock", "Item register", "Items, reorder alerts, weighted average costing, and COGS postings.", "ITEM-001"),
  projects: baseContent("Project margin", "projects and time", "Add time", "Project ledger", "Job costing, time entries, billable work, and project profitability.", "PROJ-001"),
  crm: baseContent("Customer Hub", "light CRM", "Add lead", "Customer activity", "Leads, follow-ups, customer 360 timelines, notes, and documents.", "LEAD-001"),
  integrations: baseContent("Connector marketplace", "apps and integrations", "Add connector", "Connection registry", "OAuth connectors, webhooks, public API, M-Pesa, WhatsApp, and eTIMS.", "CONN-001"),
  generic: baseContent("Operations", "workspace", "Create record", "Work queue", "Operational records linked to audit trail and ledger-safe workflows.", "OPS-001")
};

function baseContent(eyebrow: string, summaryNoun: string, primaryAction: string, tableTitle: string, tableSummary: string, reference: string) {
  return {
    eyebrow,
    summary: `Manage ${summaryNoun} with organization-scoped permissions, designed loading states, audit logging, and clear next actions.`,
    primaryAction,
    tableTitle,
    tableSummary,
    detailTitle: "Control summary",
    detailBody: "This module shell is ready for the vertical slice implementation and already follows the shared accounting workflow contract.",
    formTitle: "Record draft",
    formSummary: "Draft state captures validation before any irreversible financial action.",
    reference,
    emptyTitle: "No exceptions in this queue",
    emptyBody: "When records need attention, they appear here with a direct action and full audit context.",
    emptyAction: primaryAction,
    emptyActionIcon: <Plus className="h-4 w-4" aria-hidden="true" />,
    checks: ["Org-scoped access", "Audit log ready", "Ledger-service boundary respected"],
    metrics: [
      { label: "Open items", value: "12", meta: "Across current workspace", icon: FileText },
      { label: "Month impact", value: 326_40000, meta: "Current period", icon: CircleDollarSign },
      { label: "Controls", value: "Ready", meta: "RBAC and audit planned", icon: ShieldCheck }
    ],
    rows: sampleRows(reference.split("-")[0] ?? "REC", "review")
  };
}

function sampleRows(prefix: string, status: string): GenericRow[] {
  return [
    { id: `${prefix}-1`, record: `${prefix}-001`, owner: "Grace Wanjala", status, amountMinor: 326_40000 },
    { id: `${prefix}-2`, record: `${prefix}-002`, owner: "Mary Atieno", status: "approved", amountMinor: 884_50000 },
    { id: `${prefix}-3`, record: `${prefix}-003`, owner: "Samuel Kariuki", status: "review", amountMinor: 136_50000 }
  ];
}

function getModuleKind(pathname: string): ModuleKind {
  if (pathname.startsWith("/banking")) return "banking";
  if (pathname.startsWith("/sales")) return "sales";
  if (pathname.startsWith("/expenses")) return "expenses";
  if (pathname.startsWith("/accounting")) return "accounting";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/business-feed")) return "ai";
  if (pathname.startsWith("/settings") || pathname.startsWith("/notifications")) return "settings";
  if (pathname.startsWith("/team")) return "team";
  if (pathname.startsWith("/tax")) return "tax";
  if (pathname.startsWith("/payroll")) return "payroll";
  if (pathname.startsWith("/inventory")) return "inventory";
  if (pathname.startsWith("/projects")) return "projects";
  if (pathname.startsWith("/customer-hub")) return "crm";
  if (pathname.startsWith("/integrations")) return "integrations";
  return "generic";
}
