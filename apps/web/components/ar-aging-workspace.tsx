"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DataTable, StatusPill } from "@ledgerline/ui";
import { formatMoneyMinor } from "@ledgerline/ledger-service";

interface AgingRow {
  id: string;
  invoiceNo: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  balanceDue: string;
  currency: string;
  daysOverdue: number;
  bucket: string;
}

interface ArAgingReport {
  rows: AgingRow[];
  buckets: Record<string, number>;
}

const BUCKETS = ["current", "1-30", "31-60", "61-90", "90+"];

export function ArAgingWorkspace() {
  const { data, isLoading, error } = useQuery<ArAgingReport>({
    queryKey: ["ar-aging"],
    queryFn: () => fetch("/api/reports/ar-aging").then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500">
        Loading A/R aging report...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-rust-700">
        <p className="font-semibold">Failed to load A/R aging</p>
        <p className="text-sm">{error?.message || "Unknown error"}</p>
      </div>
    );
  }

  const totalOutstanding = Object.values(data.buckets).reduce((a, b) => a + b, 0);

  return (
    <div className="flex h-full flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 font-serif">A/R Aging Summary</h1>
        <p className="text-sm text-slate-500">Accounts receivable by aging bucket</p>
      </div>

      {/* Bucket summary cards */}
      <div className="grid grid-cols-5 gap-3">
        {BUCKETS.map((b) => (
          <div key={b} className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{b === "current" ? "Current" : `${b} days`}</p>
            <p className="mt-1 text-lg font-bold font-mono text-ink-900">
              {formatMoneyMinor(data.buckets[b] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-paper-50 px-4 py-3">
        <span className="font-semibold text-slate-700">Total Outstanding</span>
        <span className="font-mono font-bold text-ink-900">{formatMoneyMinor(totalOutstanding)}</span>
      </div>

      {/* Detail table */}
      <div className="flex-1 rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {data.rows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <p className="text-lg font-semibold text-ink-900">All caught up!</p>
            <p className="mt-1 text-sm text-slate-500">No outstanding invoices.</p>
          </div>
        ) : (
          <DataTable
            data={data.rows}
            getRowId={(row) => row.id}
            columns={[
              {
                key: "customer",
                header: "Customer",
                cell: (row) => <span className="font-medium text-ink-900">{row.customerName}</span>,
              },
              {
                key: "invoiceNo",
                header: "Invoice #",
                cell: (row) => <span className="font-mono text-slate-600">{row.invoiceNo}</span>,
              },
              {
                key: "issueDate",
                header: "Issue Date",
                cell: (row) => <span className="text-slate-600">{format(new Date(row.issueDate), "MMM d, yyyy")}</span>,
              },
              {
                key: "dueDate",
                header: "Due Date",
                cell: (row) => <span className="text-slate-600">{format(new Date(row.dueDate), "MMM d, yyyy")}</span>,
              },
              {
                key: "bucket",
                header: "Age",
                cell: (row) => (
                  <StatusPill tone={row.daysOverdue === 0 ? "success" : row.daysOverdue <= 30 ? "warning" : "danger"}>
                    {row.bucket === "current" ? "Current" : `${row.bucket} days`}
                  </StatusPill>
                ),
              },
              {
                key: "balance",
                header: "Balance Due",
                cell: (row) => (
                  <span className="font-semibold font-mono text-ink-900">
                    {formatMoneyMinor(Math.round(Number(row.balanceDue) * 100), row.currency)}
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
