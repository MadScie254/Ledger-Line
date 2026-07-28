"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, RefreshCw } from "lucide-react";
import { Button, DoubleRule } from "@ledgerline/ui";

interface ProfitAndLossReport {
  totalIncomeMinor: number;
  totalCostMinor: number;
  grossProfitMinor: number;
  netProfitMinor: number;
  error?: string;
}

const reportLinks = [
  { title: "Profit and loss", href: "/reports/profit-and-loss", description: "Live income and expense view from posted journal lines." },
  { title: "Balance sheet", href: "/reports/balance-sheet", description: "Snapshot of assets, liabilities, and equity." },
  { title: "Cash flow", href: "/reports/cash-flow", description: "Cash movement grouped by operating, investing, and financing activity." },
  { title: "Trial balance", href: "/reports/trial-balance", description: "Debits and credits rolled up by account." },
  { title: "A/R aging", href: "/reports/ar-aging", description: "Open receivables grouped by aging bucket." },
  { title: "A/P aging", href: "/reports/ap-aging", description: "Outstanding vendor balances grouped by aging bucket." }
];

export function ReportsWorkspace() {
  const [snapshot, setSnapshot] = useState<ProfitAndLossReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSnapshot();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Reporting center</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Reports</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Jump into real accounting reports and review the latest profit and loss snapshot from posted journal activity.</p>
          </div>
          <Button variant="secondary" onClick={() => void loadSnapshot(true)} disabled={isRefreshing || isLoading}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh snapshot
          </Button>
        </div>
        <DoubleRule className="mt-5" />
      </header>

      {error ? <div className="border border-rust-700/20 bg-rust-700/10 px-3 py-2 text-sm font-medium text-rust-700">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Income" value={snapshot ? formatMoney(snapshot.totalIncomeMinor) : "—"} />
        <Metric label="Cost of sales" value={snapshot ? formatMoney(snapshot.totalCostMinor) : "—"} />
        <Metric label="Gross profit" value={snapshot ? formatMoney(snapshot.grossProfitMinor) : "—"} tone={snapshot && snapshot.grossProfitMinor >= 0 ? "success" : "neutral"} />
        <Metric label="Net profit" value={snapshot ? formatMoney(snapshot.netProfitMinor) : "—"} tone={snapshot && snapshot.netProfitMinor >= 0 ? "success" : "danger"} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {reportLinks.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className="group rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger transition hover:-translate-y-0.5 hover:border-brass-500/40 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink-900">{report.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">{report.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-brass-500 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </section>

      {isLoading ? (
        <div className="flex min-h-32 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-sm font-medium text-slate-500 shadow-ledger">
          <BarChart3 className="mr-2 h-4 w-4 animate-pulse" aria-hidden="true" />
          Loading snapshot...
        </div>
      ) : null}
    </div>
  );

  async function loadSnapshot(refresh = false) {
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
        throw new Error(payload.error ?? "Failed to load report snapshot.");
      }

      setSnapshot(payload);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load report snapshot.");
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

function formatMoney(valueMinor: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(valueMinor / 100);
}
