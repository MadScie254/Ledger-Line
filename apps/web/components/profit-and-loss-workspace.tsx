"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, LoaderCircle, RefreshCw } from "lucide-react";
import { Button, DataTable, DoubleRule, EmptyState } from "@ledgerline/ui";
import { formatMoneyMinor } from "@/lib/format-money";

interface ProfitAndLossLine {
  accountId: string;
  code: string;
  name: string;
  type: string;
  movementMinor: number;
}

interface ProfitAndLossReport {
  startDate: string;
  endDate: string;
  totalIncomeMinor: number;
  totalCostMinor: number;
  totalExpenseMinor: number;
  grossProfitMinor: number;
  netProfitMinor: number;
  lineCount: number;
  topLines: ProfitAndLossLine[];
  error?: string;
}

const columns = [
  { key: "code", header: "Code", cell: (line: ProfitAndLossLine) => <span className="font-mono text-xs font-semibold tabular-nums">{line.code}</span> },
  { key: "name", header: "Account", cell: (line: ProfitAndLossLine) => <span className="font-medium text-ink-900">{line.name}</span> },
  { key: "type", header: "Type", cell: (line: ProfitAndLossLine) => <span className="text-slate-500">{line.type}</span> },
  { key: "movementMinor", header: "Movement", align: "right", cell: (line: ProfitAndLossLine) => <span className="font-mono text-xs tabular-nums">{formatMoney(line.movementMinor)}</span> }
] as const;

export function ProfitAndLossWorkspace() {
  const [report, setReport] = useState<ProfitAndLossReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadReport();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Reporting</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Profit and loss</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">A live profit and loss view computed from posted journal lines in Postgres.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void loadReport(true)} disabled={isRefreshing || isLoading}>
              {isRefreshing ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
              Refresh
            </Button>
            <Link href="/reports" className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-900 transition hover:bg-paper-100">
              Back to reports
            </Link>
          </div>
        </div>
        <DoubleRule className="mt-5" />
      </header>

      {error ? <div className="border border-rust-700/20 bg-rust-700/10 px-3 py-2 text-sm font-medium text-rust-700">{error}</div> : null}

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-sm font-medium text-slate-500 shadow-ledger">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Loading profit and loss...
        </div>
      ) : report ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric label="Income" value={formatMoney(report.totalIncomeMinor)} tone="success" />
            <Metric label="Cost of sales" value={formatMoney(report.totalCostMinor)} tone="neutral" />
            <Metric label="Gross profit" value={formatMoney(report.grossProfitMinor)} tone={report.grossProfitMinor >= 0 ? "success" : "danger"} />
            <Metric label="Net profit" value={formatMoney(report.netProfitMinor)} tone={report.netProfitMinor >= 0 ? "success" : "danger"} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-3 rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink-900">Top operating accounts</h2>
                  <p className="mt-1 text-sm text-slate-500">{report.lineCount} journal lines rolled into this view.</p>
                </div>
                <BarChart3 className="h-5 w-5 text-brass-500" aria-hidden="true" />
              </div>
              <DataTable columns={columns as never} data={report.topLines} getRowId={(line) => line.accountId} />
            </div>

            <aside className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
              <h2 className="text-lg font-semibold text-ink-900">Period</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{formatDate(report.startDate)} through {formatDate(report.endDate)}.</p>
              <DoubleRule className="my-4" />
              <p className="text-sm text-slate-500">The report only counts journal entries posted in this organization. To change the output, add or reverse ledger postings.</p>
            </aside>
          </section>
        </>
      ) : (
        <EmptyState
          icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />}
          title="No report data yet"
          body="Post a journal entry, invoice, expense, or bill to populate the live report."
          action={<Button variant="secondary" onClick={() => void loadReport(true)}>Refresh</Button>}
        />
      )}
    </div>
  );

  async function loadReport(refresh = false) {
    setError(null);
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch("/api/reports/profit-and-loss", { cache: "no-store" });
      const payload = (await response.json()) as ProfitAndLossReport;

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load report.");
      }

      setReport(payload);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load report.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }
}

function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "success" | "danger" }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className={`mt-3 font-mono text-2xl font-semibold tabular-nums ${tone === "success" ? "text-ledger-green-700" : tone === "danger" ? "text-rust-700" : "text-ink-900"}`}>{value}</p>
    </div>
  );
}

function formatMoney(valueMinor: number, currency = "KES") {
  return formatMoneyMinor(valueMinor, currency, 0);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}
