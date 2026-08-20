"use client";

import { useQuery } from "@tanstack/react-query";
import { formatMoneyMinor } from "@ledgerline/ledger-service";
import { StatusPill } from "@ledgerline/ui";

interface CashFlowReport {
  operatingActivities: {
    netIncome: number;
    adjustments: number;
    netOperatingCash: number;
  };
  investingActivities: {
    netInvestingCash: number;
  };
  financingActivities: {
    netFinancingCash: number;
  };
  netIncreaseInCash: number;
  endingCashBalance: number;
}

export function CashFlowWorkspace() {
  const { data, error, isLoading } = useQuery<CashFlowReport>({
    queryKey: ["cash-flow"],
    queryFn: () => fetch("/api/reports/cash-flow").then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500">
        Loading cash flow statement...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-rust-700">
        <p className="font-semibold">Failed to load cash flow</p>
        <p className="text-sm">{error?.message || "Unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-serif">Statement of Cash Flows</h1>
          <p className="text-sm text-slate-500">Year to date</p>
        </div>
        <StatusPill tone="neutral">YTD</StatusPill>
      </div>

      <div className="rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col text-sm">
        
        {/* Operating Activities */}
        <div className="px-4 py-3 bg-paper-50 border-b border-slate-200">
          <h2 className="font-semibold uppercase tracking-wider text-slate-700">Operating Activities</h2>
        </div>
        <div className="flex justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-slate-700">Net Income</span>
          <span className="font-mono text-ink-900">{formatMoneyMinor(data.operatingActivities.netIncome)}</span>
        </div>
        <div className="flex justify-between px-4 py-3 border-b border-slate-100 bg-paper-50/50">
          <span className="font-semibold text-slate-700">Net Cash from Operating Activities</span>
          <span className="font-mono font-bold text-ink-900">{formatMoneyMinor(data.operatingActivities.netOperatingCash)}</span>
        </div>

        {/* Investing Activities */}
        <div className="px-4 py-3 bg-paper-50 border-y border-slate-200 mt-4">
          <h2 className="font-semibold uppercase tracking-wider text-slate-700">Investing Activities</h2>
        </div>
        <div className="flex justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-slate-700">Purchases of Property & Equipment</span>
          <span className="font-mono text-slate-300">—</span>
        </div>
        <div className="flex justify-between px-4 py-3 border-b border-slate-100 bg-paper-50/50">
          <span className="font-semibold text-slate-700">Net Cash from Investing Activities</span>
          <span className="font-mono font-bold text-ink-900">{formatMoneyMinor(data.investingActivities.netInvestingCash)}</span>
        </div>

        {/* Financing Activities */}
        <div className="px-4 py-3 bg-paper-50 border-y border-slate-200 mt-4">
          <h2 className="font-semibold uppercase tracking-wider text-slate-700">Financing Activities</h2>
        </div>
        <div className="flex justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-slate-700">Proceeds from Loans</span>
          <span className="font-mono text-slate-300">—</span>
        </div>
        <div className="flex justify-between px-4 py-3 border-b border-slate-100 bg-paper-50/50">
          <span className="font-semibold text-slate-700">Net Cash from Financing Activities</span>
          <span className="font-mono font-bold text-ink-900">{formatMoneyMinor(data.financingActivities.netFinancingCash)}</span>
        </div>

        {/* Summary */}
        <div className="mt-4 p-4 flex flex-col space-y-2 border-t-2 border-slate-200 bg-paper-50">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-700">Net Increase in Cash</span>
            <span className="font-mono font-bold text-ink-900">{formatMoneyMinor(data.netIncreaseInCash)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-700">Ending Cash Balance</span>
            <span className="font-mono font-bold text-ink-900">{formatMoneyMinor(data.endingCashBalance)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
