"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button, DataTable } from "@ledgerline/ui";
import { Plus } from "lucide-react";
import { formatMoneyMinor } from "@ledgerline/ledger-service";

interface BillPayment {
  id: string;
  date: string;
  amount: string; // Decimal as string
  method: string;
  reference: string | null;
  bill: {
    id: string;
    billNo: string;
    vendor: { displayName: string };
  } | null;
}

export function ExpensesBillPaymentsWorkspace() {
  const { data: payments, isLoading, error } = useQuery<BillPayment[]>({
    queryKey: ["bill-payments"],
    queryFn: () => fetch("/api/expenses/bill-payments").then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500">
        Loading bill payments...
      </div>
    );
  }

  if (error || !payments) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-rust-700">
        <p className="font-semibold">Failed to load bill payments</p>
        <p className="text-sm">{error?.message || "Unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-serif">Bill Payments</h1>
          <p className="text-sm text-slate-500">Record and track payments applied to vendor bills.</p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="h-4 w-4" />
          Record payment
        </Button>
      </div>

      <div className="flex-1 rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {payments.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-paper-100">
              <span className="text-2xl text-slate-400">🧾</span>
            </div>
            <h3 className="text-lg font-semibold text-ink-900">No bill payments yet</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Record a payment to apply it against one or more vendor bills.
            </p>
          </div>
        ) : (
          <DataTable
            data={payments}
            getRowId={(row) => row.id}
            columns={[
              {
                key: "date",
                header: "Date",
                cell: (row) => <span className="text-slate-600">{format(new Date(row.date), "MMM d, yyyy")}</span>,
              },
              {
                key: "vendor",
                header: "Vendor",
                cell: (row) => (
                  <span className="font-medium text-ink-900">{row.bill?.vendor?.displayName ?? "—"}</span>
                ),
              },
              {
                key: "bill",
                header: "Bill No.",
                cell: (row) => (
                  <span className="text-slate-600 font-mono">{row.bill?.billNo ?? "—"}</span>
                ),
              },
              {
                key: "method",
                header: "Method",
                cell: (row) => <span className="text-slate-600 capitalize">{row.method}</span>,
              },
              {
                key: "reference",
                header: "Reference",
                cell: (row) => <span className="text-slate-500 font-mono">{row.reference ?? "—"}</span>,
              },
              {
                key: "amount",
                header: "Amount",
                cell: (row) => (
                  <span className="font-semibold text-ink-900 font-mono">
                    {formatMoneyMinor(Math.round(Number(row.amount) * 100))}
                  </span>
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
