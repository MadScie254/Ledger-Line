import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Circle,
  FileText,
  Landmark,
  LineChart,
  ReceiptText,
  Sparkles,
  TriangleAlert,
  WalletCards
} from "lucide-react";
import {
  Button,
  CurrencyAmount,
  DataTable,
  DoubleRule,
  KpiCard,
  StatusPill,
  type DataTableColumn
} from "@ledgerline/ui";
import type { BankTransaction, BusinessFeedItem, InvoiceSummary } from "@ledgerline/types";
import { CashFlowChart, ExpenseDonut, ProfitComparison } from "@/components/dashboard-charts";
import { getDashboardModel } from "@/lib/demo-data";

export default function DashboardPage() {
  const model = getDashboardModel();
  const setupDone = model.setupTasks.filter((task) => task.done).length;
  const setupProgress = Math.round((setupDone / model.setupTasks.length) * 100);

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Close-ready workspace</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900 md:text-5xl">
              {model.organization.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              Books through July 22, 2026. Dashboard figures are derived from posted journal lines in the ledger service.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Trial balance
            </Button>
            <Button variant="primary">
              <ReceiptText className="h-4 w-4" aria-hidden="true" />
              Create invoice
            </Button>
          </div>
        </div>
        <DoubleRule className="mt-5" />
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Net profit"
          value={<CurrencyAmount amountMinor={model.pnl.netProfitMinor} />}
          change="+8.4% vs prior month"
          trend="up"
          meta="Accrual basis"
          icon={<LineChart className="h-4 w-4" aria-hidden="true" />}
        />
        <KpiCard
          label="Income"
          value={<CurrencyAmount amountMinor={model.pnl.incomeMinor} tone="income" />}
          change="2 posted sources"
          trend="up"
          meta="KES base"
          icon={<Banknote className="h-4 w-4" aria-hidden="true" />}
        />
        <KpiCard
          label="Expenses"
          value={<CurrencyAmount amountMinor={model.pnl.expenseMinor + model.pnl.cogsMinor} tone="expense" />}
          change="Fuel above trend"
          trend="down"
          meta="COGS included"
          icon={<WalletCards className="h-4 w-4" aria-hidden="true" />}
        />
        <KpiCard
          label="Cash balance"
          value={<CurrencyAmount amountMinor={model.cashBalanceMinor} />}
          change="Bank + M-Pesa"
          trend="flat"
          meta="2 accounts"
          icon={<Landmark className="h-4 w-4" aria-hidden="true" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.6fr)]">
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Cash flow command view</h2>
              <p className="mt-1 text-sm text-slate-500">Twelve months of actual cash movement with open-item projection.</p>
            </div>
            <StatusPill tone={model.isTrialBalanceClean ? "success" : "danger"}>
              {model.isTrialBalanceClean ? "Balanced" : "Review"}
            </StatusPill>
          </div>
          <DoubleRule className="my-4" />
          <CashFlowChart data={model.cashFlowSeries} />
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Expense mix</h2>
              <p className="mt-1 text-sm text-slate-500">Current-month posted costs by ledger account.</p>
            </div>
            <Button variant="ghost" size="sm">
              Details
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <DoubleRule className="my-4" />
          <ExpenseDonut data={model.expenseBreakdown} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(320px,0.55fr)_minmax(0,1fr)_minmax(340px,0.7fr)]">
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <h2 className="text-lg font-semibold text-ink-900">Get ready to use</h2>
          <p className="mt-1 text-sm text-slate-500">Setup tasks for compliant, close-ready books.</p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{setupDone} of {model.setupTasks.length} complete</span>
              <span>{setupProgress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-100">
              <div className="h-full rounded-full bg-brass-500" style={{ width: `${setupProgress}%` }} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {model.setupTasks.map((task) => (
              <div key={task.label} className="flex items-center justify-between rounded-[6px] bg-paper-50 px-3 py-2">
                <span className="text-sm font-medium text-ink-900">{task.label}</span>
                {task.done ? (
                  <CheckCircle2 className="h-4 w-4 text-ledger-green-700" aria-label="Complete" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300" aria-label="Incomplete" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Open invoices</h2>
              <p className="mt-1 text-sm text-slate-500">Receivables aging from invoice and payment journals.</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">AR balance</p>
              <CurrencyAmount amountMinor={model.arBalanceMinor} className="text-lg font-semibold" />
            </div>
          </div>
          <DoubleRule className="my-4" />
          <DataTable columns={invoiceColumns} data={model.invoices} getRowId={(row) => row.id} />
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brass-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-ink-900">Business Feed</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Deterministic insights over posted accounting data.</p>
          <DoubleRule className="my-4" />
          <div className="space-y-3">
            {model.businessFeed.map((item) => (
              <FeedItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Bank and mobile-money feed</h2>
              <p className="mt-1 text-sm text-slate-500">AI suggestions remain human-confirmed before posting.</p>
            </div>
            <Button variant="secondary" size="sm">
              Reconcile
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <DoubleRule className="my-4" />
          <DataTable columns={bankColumns} data={model.bankTransactions} getRowId={(row) => row.id} />
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <h2 className="text-lg font-semibold text-ink-900">P&L comparison</h2>
          <p className="mt-1 text-sm text-slate-500">Current month against prior close.</p>
          <DoubleRule className="my-4" />
          <ProfitComparison />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[6px] bg-paper-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">AP exposure</p>
              <CurrencyAmount amountMinor={model.apBalanceMinor} tone="expense" className="mt-1 block text-lg font-semibold" />
            </div>
            <div className="rounded-[6px] bg-paper-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">VAT payable</p>
              <CurrencyAmount amountMinor={310_27600} className="mt-1 block text-lg font-semibold" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const invoiceColumns: DataTableColumn<InvoiceSummary>[] = [
  {
    key: "invoiceNo",
    header: "Invoice",
    cell: (row) => <span className="font-mono text-xs font-semibold tabular-nums">{row.invoiceNo}</span>
  },
  {
    key: "customerName",
    header: "Customer",
    cell: (row) => row.customerName
  },
  {
    key: "dueDate",
    header: "Due",
    cell: (row) => <span className="font-mono text-xs tabular-nums">{row.dueDate}</span>
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusPill tone={invoiceTone(row.status)}>{row.status}</StatusPill>
  },
  {
    key: "balance",
    header: "Balance",
    align: "right",
    cell: (row) => <CurrencyAmount amountMinor={row.balanceDueMinor} />
  }
];

const bankColumns: DataTableColumn<BankTransaction>[] = [
  {
    key: "date",
    header: "Date",
    cell: (row) => <span className="font-mono text-xs tabular-nums">{row.date}</span>
  },
  {
    key: "description",
    header: "Description",
    cell: (row) => <span className="font-medium">{row.description}</span>
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    cell: (row) => <CurrencyAmount amountMinor={row.amountMinor} tone={row.direction === "in" ? "income" : "expense"} />
  },
  {
    key: "category",
    header: "AI category",
    cell: (row) => (
      <div>
        <p>{row.aiSuggestedCategory}</p>
        <p className="font-mono text-[11px] text-slate-500">{Math.round(row.confidence * 100)}% confidence</p>
      </div>
    )
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusPill tone={bankTone(row.status)}>{row.status}</StatusPill>
  }
];

function FeedItem({ item }: { item: BusinessFeedItem }) {
  const tone = item.severity === "critical" || item.severity === "warning" ? "warning" : item.severity;

  return (
    <Link href={item.link} className="block rounded-[6px] border border-slate-200 bg-paper-50 p-3 transition hover:border-brass-500 focus-ring">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-white text-brass-500">
          {item.severity === "warning" || item.severity === "critical" ? (
            <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink-900">{item.title}</h3>
            <StatusPill tone={tone}>{item.severity}</StatusPill>
          </div>
          <p className="mt-1 text-sm leading-5 text-slate-500">{item.body}</p>
          {item.amountMinor ? <CurrencyAmount amountMinor={item.amountMinor} className="mt-2 block text-sm font-semibold" /> : null}
        </div>
      </div>
    </Link>
  );
}

function invoiceTone(status: InvoiceSummary["status"]) {
  if (status === "paid") return "success";
  if (status === "overdue" || status === "void") return "danger";
  if (status === "partial" || status === "viewed") return "warning";
  return "neutral";
}

function bankTone(status: BankTransaction["status"]) {
  if (status === "matched" || status === "categorized") return "success";
  if (status === "unreviewed") return "warning";
  return "neutral";
}
