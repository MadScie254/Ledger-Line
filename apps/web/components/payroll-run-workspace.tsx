"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button, DataTable, StatusPill } from "@ledgerline/ui";
import { Plus } from "lucide-react";
import { formatMoneyMinor } from "@ledgerline/ledger-service";

interface PayRun {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: "DRAFT" | "APPROVED" | "PAID";
  totals: {
    netPayMinor?: number;
    taxesMinor?: number;
    grossPayMinor?: number;
  };
}

export function PayrollRunWorkspace() {
  const { data: payRuns, isLoading, error } = useQuery<PayRun[]>({
    queryKey: ["payroll-runs"],
    queryFn: () => fetch("/api/payroll/run").then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500">
        Loading pay runs...
      </div>
    );
  }

  if (error || !payRuns) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-rust-700">
        <p className="font-semibold">Failed to load pay runs</p>
        <p className="text-sm">{error?.message || "Unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-serif">Run Payroll</h1>
          <p className="text-sm text-slate-500">Manage and execute your pay cycles.</p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="h-4 w-4" />
          Start pay run
        </Button>
      </div>

      <div className="flex-1 rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {payRuns.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-paper-100">
              <span className="text-2xl text-slate-400">💸</span>
            </div>
            <h3 className="text-lg font-semibold text-ink-900">No pay runs yet</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              You haven&apos;t started any pay runs. Click &quot;Start pay run&quot; to begin processing payroll for a period.
            </p>
          </div>
        ) : (
          <DataTable
            data={payRuns}
            getRowId={(row) => row.id}
            columns={[
              {
                key: "period",
                header: "Period",
                cell: (row) => (
                  <span className="font-medium">
                    {format(new Date(row.periodStart), "MMM d, yyyy")} - {format(new Date(row.periodEnd), "MMM d, yyyy")}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (row) => (
                  <StatusPill 
                    tone={
                      row.status === "PAID" ? "success" :
                      row.status === "APPROVED" ? "info" : "neutral"
                    }
                  >
                    {row.status}
                  </StatusPill>
                ),
              },
              {
                key: "grossPay",
                header: "Gross Pay",
                cell: (row) => row.totals?.grossPayMinor ? formatMoneyMinor(row.totals.grossPayMinor) : "—",
                align: "right",
              },
              {
                key: "taxes",
                header: "Taxes",
                cell: (row) => row.totals?.taxesMinor ? formatMoneyMinor(row.totals.taxesMinor) : "—",
                align: "right",
              },
              {
                key: "netPay",
                header: "Net Pay",
                cell: (row) => (
                  <span className="font-semibold text-ink-900">
                    {row.totals?.netPayMinor ? formatMoneyMinor(row.totals.netPayMinor) : "—"}
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
