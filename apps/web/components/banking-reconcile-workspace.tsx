"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button, DataTable, StatusPill } from "@ledgerline/ui";
import { CheckCircle2, CopyCheck } from "lucide-react";
import { formatMoneyMinor } from "@ledgerline/ledger-service";

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: string; // Decimal as string
  direction: "IN" | "OUT";
  status: "UNREVIEWED" | "CATEGORIZED" | "MATCHED" | "EXCLUDED";
  bankConnection: {
    institutionName: string;
    currency: string;
  };
  aiSuggestedCategory: string | null;
  confidence: number | null;
}

export function BankingReconcileWorkspace() {
  const { data: transactions, isLoading, error } = useQuery<BankTransaction[]>({
    queryKey: ["bank-transactions-unreviewed"],
    queryFn: () => fetch("/api/banking/reconcile").then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500">
        Loading transactions...
      </div>
    );
  }

  if (error || !transactions) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-rust-700">
        <p className="font-semibold">Failed to load transactions</p>
        <p className="text-sm">{error?.message || "Unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-serif">Reconcile Transactions</h1>
          <p className="text-sm text-slate-500">Review and match downloaded bank transactions to ledger entries.</p>
        </div>
      </div>

      <div className="flex-1 rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {transactions.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ledger-green-700/10">
              <CheckCircle2 className="h-6 w-6 text-ledger-green-700" />
            </div>
            <h3 className="text-lg font-semibold text-ink-900">All caught up!</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              There are no unreviewed transactions. Your bank feeds are fully reconciled.
            </p>
          </div>
        ) : (
          <DataTable
            data={transactions}
            getRowId={(row) => row.id}
            columns={[
              {
                key: "date",
                header: "Date",
                cell: (row) => <span className="text-slate-600">{format(new Date(row.date), "MMM d, yyyy")}</span>,
              },
              {
                key: "description",
                header: "Description",
                cell: (row) => (
                  <div>
                    <div className="font-medium text-ink-900">{row.description}</div>
                    <div className="text-xs text-slate-500">{row.bankConnection.institutionName}</div>
                  </div>
                ),
              },
              {
                key: "aiSuggestion",
                header: "Suggested Category",
                cell: (row) => row.aiSuggestedCategory ? (
                  <StatusPill tone="info">
                    {row.aiSuggestedCategory}
                  </StatusPill>
                ) : <span className="text-slate-400">—</span>,
              },
              {
                key: "amount",
                header: "Amount",
                cell: (row) => (
                  <span className={`font-semibold font-mono ${row.direction === "IN" ? "text-ledger-green-700" : "text-ink-900"}`}>
                    {row.direction === "IN" ? "+" : "-"}{formatMoneyMinor(Math.round(Number(row.amount) * 100), row.bankConnection.currency)}
                  </span>
                ),
                align: "right",
              },
              {
                key: "action",
                header: "",
                cell: () => (
                  <Button variant="secondary" className="h-8 py-0 px-3">
                    Match
                  </Button>
                ),
                align: "right",
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
