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

interface TrialBalanceRow {
  account: Account;
  debitMinor: number;
  creditMinor: number;
  balanceMinor: number;
}

interface TrialBalanceReport {
  rows: TrialBalanceRow[];
  debitTotal: number;
  creditTotal: number;
  isBalanced: boolean;
}

export function TrialBalanceWorkspace() {
  const { data, error, isLoading } = useQuery<TrialBalanceReport>({
    queryKey: ["trial-balance"],
    queryFn: () => fetch("/api/reports/trial-balance").then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500">
        Loading trial balance...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-rust-700">
        <p className="font-semibold">Failed to load trial balance</p>
        <p className="text-sm">{error?.message || "Unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-serif">Trial Balance</h1>
          <p className="text-sm text-slate-500">A snapshot of all account balances</p>
        </div>
        <StatusPill tone={data.isBalanced ? "success" : "danger"}>
          {data.isBalanced ? "Balanced" : "Unbalanced"}
        </StatusPill>
      </div>

      <div className="flex-1 rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <DataTable
          data={data.rows}
          getRowId={(row) => row.account.id}
          columns={[
            {
              key: "code",
              header: "Code",
              cell: (row) => row.account.code,
            },
            {
              key: "name",
              header: "Account",
              cell: (row) => row.account.name,
            },
            {
              key: "type",
              header: "Type",
              cell: (row) => (
                <span className="text-xs uppercase tracking-wider text-slate-500">
                  {row.account.type}
                </span>
              ),
            },
            {
              key: "debit",
              header: "Debit",
              cell: (row) => (
                <span className={row.debitMinor > 0 ? "text-ink-900 font-medium font-mono" : "text-slate-300 font-mono"}>
                  {formatMoneyMinor(row.debitMinor)}
                </span>
              ),
              align: "right",
            },
            {
              key: "credit",
              header: "Credit",
              cell: (row) => (
                <span className={row.creditMinor > 0 ? "text-ink-900 font-medium font-mono" : "text-slate-300 font-mono"}>
                  {formatMoneyMinor(row.creditMinor)}
                </span>
              ),
              align: "right",
            },
          ]}
        />
        
        {/* Footer Totals */}
        <div className="bg-paper-50 border-t border-slate-200 p-4">
          <div className="flex items-center">
            <div className="flex-1 flex justify-end pr-8">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Totals
              </span>
            </div>
            <div className="w-[160px] text-right font-mono font-bold text-ink-900 pr-4">
              {formatMoneyMinor(data.debitTotal)}
            </div>
            <div className="w-[160px] text-right font-mono font-bold text-ink-900 pr-4">
              {formatMoneyMinor(data.creditTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
