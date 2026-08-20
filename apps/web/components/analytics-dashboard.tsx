"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { DoubleRule } from "@ledgerline/ui";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendData {
  month: string;
  revenue: number;
  expenses: number;
}

interface AnalyticsPayload {
  trend: TrendData[];
  summary: {
    revenue: number;
    expenses: number;
    netProfit: number;
  };
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/analytics");
        const json = await res.json();
        setData(json);
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center border border-slate-200 bg-white text-sm font-medium text-slate-500 rounded-[8px]">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading analytics...
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Analytics</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">
          Financial Performance
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          A high-level view of trailing revenue, expenses, and net profit.
        </p>
        <DoubleRule className="mt-5" />
      </header>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Revenue</p>
          <p className="mt-2 text-2xl font-bold text-ink-900">{formatCurrency(data.summary.revenue)}</p>
        </div>
        <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Expenses</p>
          <p className="mt-2 text-2xl font-bold text-ink-900">{formatCurrency(data.summary.expenses)}</p>
        </div>
        <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Net Profit</p>
          <p className="mt-2 text-2xl font-bold text-ink-900">{formatCurrency(data.summary.netProfit)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-ink-900 mb-6">6-Month Trend</h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#64748b" }} 
                tickFormatter={(val) => `$${val / 1000}k`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="Revenue"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="#f43f5e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorExpenses)" 
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
