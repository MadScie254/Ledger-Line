"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button, DataTable, StatusPill } from "@ledgerline/ui";
import { Download } from "lucide-react";
import { formatMoneyMinor } from "@ledgerline/ledger-service";

interface Payslip {
  id: string;
  payRunId: string;
  employee: {
    id: string;
    name: string;
  };
  payRun: {
    id: string;
    periodStart: string;
    periodEnd: string;
    status: string;
  };
  netPay: string; // Decimal returned as string
  pdfUrl: string | null;
}

export function PayrollPayslipsWorkspace() {
  const { data: payslips, isLoading, error } = useQuery<Payslip[]>({
    queryKey: ["payslips"],
    queryFn: () => fetch("/api/payroll/payslips").then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500">
        Loading payslips...
      </div>
    );
  }

  if (error || !payslips) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-rust-700">
        <p className="font-semibold">Failed to load payslips</p>
        <p className="text-sm">{error?.message || "Unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-serif">Payslips</h1>
          <p className="text-sm text-slate-500">View and download generated employee payslips.</p>
        </div>
      </div>

      <div className="flex-1 rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {payslips.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-paper-100">
              <span className="text-2xl text-slate-400">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-ink-900">No payslips generated</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Payslips will appear here automatically once a pay run is approved and processed.
            </p>
          </div>
        ) : (
          <DataTable
            data={payslips}
            getRowId={(row) => row.id}
            columns={[
              {
                key: "employee",
                header: "Employee",
                cell: (row) => <span className="font-medium text-ink-900">{row.employee.name}</span>,
              },
              {
                key: "period",
                header: "Pay Period",
                cell: (row) => (
                  <span className="text-slate-600">
                    {format(new Date(row.payRun.periodStart), "MMM d")} - {format(new Date(row.payRun.periodEnd), "MMM d, yyyy")}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Run Status",
                cell: (row) => (
                  <StatusPill 
                    tone={
                      row.payRun.status === "PAID" ? "success" :
                      row.payRun.status === "APPROVED" ? "info" : "neutral"
                    }
                  >
                    {row.payRun.status}
                  </StatusPill>
                ),
              },
              {
                key: "netPay",
                header: "Net Pay",
                cell: (row) => (
                  <span className="font-semibold text-ink-900">
                    {formatMoneyMinor(Math.round(Number(row.netPay) * 100))}
                  </span>
                ),
                align: "right",
              },
              {
                key: "action",
                header: "",
                cell: (row) => (
                  <Button variant="ghost" className="h-8 px-2 text-slate-500 hover:text-ink-900" disabled={!row.pdfUrl}>
                    <Download className="h-4 w-4" />
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
