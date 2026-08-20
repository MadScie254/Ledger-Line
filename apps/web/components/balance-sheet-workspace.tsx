"use client";

import { useQuery } from "@tanstack/react-query";
import { formatMoneyMinor } from "@ledgerline/ledger-service";
import { DataTable, StatusPill } from "@ledgerline/ui";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface BalanceSheetRow {
  account: Account;
  balanceMinor: number;
}

interface BalanceSheetReport {
  assets: BalanceSheetRow[];
  liabilities: BalanceSheetRow[];
  equity: BalanceSheetRow[];
  assetsTotal: number;
  liabilitiesTotal: number;
  equityTotal: number;
  liabilitiesAndEquityTotal: number;
  isBalanced: boolean;
}

export function BalanceSheetWorkspace() {
  const { data, error, isLoading } = useQuery<BalanceSheetReport>({
    queryKey: ["balance-sheet"],
    queryFn: () => fetch("/api/reports/balance-sheet").then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500">
        Loading balance sheet...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-rust-700">
        <p className="font-semibold">Failed to load balance sheet</p>
        <p className="text-sm">{error?.message || "Unknown error occurred"}</p>
      </div>
    );
  }

  const columns = [
    {
      key: "code",
      header: "Code",
      cell: (row: BalanceSheetRow) => row.account.code || "—",
    },
    {
      key: "name",
      header: "Account",
      cell: (row: BalanceSheetRow) => row.account.name,
    },
    {
      key: "balance",
      header: "Balance",
      cell: (row: BalanceSheetRow) => (
        <span className={row.balanceMinor < 0 ? "text-rust-700 font-medium font-mono" : "text-ink-900 font-medium font-mono"}>
          {formatMoneyMinor(row.balanceMinor)}
        </span>
      ),
      align: "right" as const,
    },
  ];

  return (
    <div className="flex h-full flex-col space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-serif">Balance Sheet</h1>
          <p className="text-sm text-slate-500">As of today</p>
        </div>
        <StatusPill tone={data.isBalanced ? "success" : "danger"}>
          {data.isBalanced ? "Balanced" : "Unbalanced"}
        </StatusPill>
      </div>

      <div className="space-y-6">
        {/* Assets */}
        <div className="rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-paper-50 border-b border-slate-200">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Assets</h2>
          </div>
          <DataTable
            data={data.assets}
            getRowId={(row) => row.account.id}
            columns={columns}
          />
          <div className="bg-paper-50 border-t border-slate-200 p-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700 pl-2">Total Assets</span>
            <span className="font-mono font-bold text-ink-900 pr-2">
              {formatMoneyMinor(data.assetsTotal)}
            </span>
          </div>
        </div>

        {/* Liabilities */}
        <div className="rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-paper-50 border-b border-slate-200">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Liabilities</h2>
          </div>
          <DataTable
            data={data.liabilities}
            getRowId={(row) => row.account.id}
            columns={columns}
          />
          <div className="bg-paper-50 border-t border-slate-200 p-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700 pl-2">Total Liabilities</span>
            <span className="font-mono font-bold text-ink-900 pr-2">
              {formatMoneyMinor(data.liabilitiesTotal)}
            </span>
          </div>
        </div>

        {/* Equity */}
        <div className="rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-paper-50 border-b border-slate-200">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Equity</h2>
          </div>
          <DataTable
            data={data.equity}
            getRowId={(row) => row.account.id}
            columns={columns}
          />
          <div className="bg-paper-50 border-t border-slate-200 p-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700 pl-2">Total Equity</span>
            <span className="font-mono font-bold text-ink-900 pr-2">
              {formatMoneyMinor(data.equityTotal)}
            </span>
          </div>
        </div>

        {/* Final Check */}
        <div className="rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden p-4 flex justify-between items-center bg-gradient-to-r from-paper-50 to-white">
          <span className="text-sm font-semibold uppercase tracking-wider text-slate-700">Total Liabilities & Equity</span>
          <span className="font-mono font-bold text-ink-900 text-lg">
            {formatMoneyMinor(data.liabilitiesAndEquityTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
