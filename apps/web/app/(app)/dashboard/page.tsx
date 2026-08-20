"use client";

import { useEffect, useState } from "react";
import { DoubleRule } from "@ledgerline/ui";
import { formatMoneyMinor } from "@ledgerline/ledger-service";
import { useQuery } from "@tanstack/react-query";
import { TrendLineChart, ProfitComparison } from "@/components/dashboard-charts";

interface DashboardData {
  kpis: {
    unpaidInvoices: number;
    unpaidBills: number;
    cashBalance: number;
  };
  recentActivity: Array<{
    id: string;
    date: string;
    memo: string | null;
    amount: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard.");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const { data: analyticsData } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetch("/api/analytics").then((res) => res.json()),
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">{error || "Could not load data."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Overview</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Dashboard</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Your financial snapshot and recent activity.
        </p>
        <DoubleRule className="mt-5" />
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-ledger">
          <p className="text-sm font-medium text-slate-500">Cash Balance</p>
          <p className="mt-2 text-3xl font-semibold text-ink-900 font-mono">
            {formatMoneyMinor(data.kpis.cashBalance)}
          </p>
        </article>

        <article className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-ledger">
          <p className="text-sm font-medium text-slate-500">Unpaid Invoices</p>
          <p className="mt-2 text-3xl font-semibold text-ink-900 font-mono">
            {formatMoneyMinor(data.kpis.unpaidInvoices)}
          </p>
        </article>

        <article className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-ledger">
          <p className="text-sm font-medium text-slate-500">Unpaid Bills</p>
          <p className="mt-2 text-3xl font-semibold text-ink-900 font-mono">
            {formatMoneyMinor(data.kpis.unpaidBills)}
          </p>
        </article>
      </section>

      {analyticsData?.data && (
        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-ledger">
            <h2 className="text-base font-semibold text-ink-900 mb-4">Revenue & Expenses Trend</h2>
            <TrendLineChart data={analyticsData.data} />
          </div>
          <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-ledger">
            <h2 className="text-base font-semibold text-ink-900 mb-4">Profit Comparison</h2>
            <ProfitComparison data={analyticsData.data} />
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink-900">Recent Activity</h2>
        <DoubleRule className="my-4" />
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-slate-500">No recent activity.</p>
        ) : (
          <div className="rounded-[8px] border border-slate-200 bg-white shadow-ledger">
            <ul className="divide-y divide-slate-100">
              {data.recentActivity.map((activity) => (
                <li key={activity.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{activity.memo || "Journal Entry"}</p>
                    <p className="text-xs text-slate-500">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-semibold font-mono text-ink-900">
                    {formatMoneyMinor(activity.amount)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
