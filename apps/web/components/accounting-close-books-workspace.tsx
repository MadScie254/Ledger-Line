"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button, DataTable, StatusPill } from "@ledgerline/ui";
import { Lock } from "lucide-react";

interface AccountingPeriod {
  id: string;
  startDate: string;
  endDate: string;
  status: "OPEN" | "CLOSED" | "LOCKED";
  closedByUser?: {
    name: string;
    email: string;
  } | null;
  closedAt?: string | null;
}

export function AccountingCloseBooksWorkspace() {
  const { data: periods, isLoading, error } = useQuery<AccountingPeriod[]>({
    queryKey: ["accounting-periods"],
    queryFn: () => fetch("/api/accounting/close-books").then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500">
        Loading accounting periods...
      </div>
    );
  }

  if (error || !periods) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-rust-700">
        <p className="font-semibold">Failed to load periods</p>
        <p className="text-sm">{error?.message || "Unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-serif">Close Books</h1>
          <p className="text-sm text-slate-500">Manage financial periods and prevent retroactive changes.</p>
        </div>
        <Button variant="primary" className="gap-2">
          <Lock className="h-4 w-4" />
          Close period
        </Button>
      </div>

      <div className="flex-1 rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {periods.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-paper-100">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-ink-900">No periods closed</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              You haven&apos;t defined or closed any accounting periods yet.
            </p>
          </div>
        ) : (
          <DataTable
            data={periods}
            getRowId={(row) => row.id}
            columns={[
              {
                key: "period",
                header: "Period",
                cell: (row) => (
                  <span className="font-medium text-ink-900">
                    {format(new Date(row.startDate), "MMM d, yyyy")} - {format(new Date(row.endDate), "MMM d, yyyy")}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (row) => (
                  <StatusPill 
                    tone={
                      row.status === "CLOSED" ? "success" :
                      row.status === "LOCKED" ? "info" : "neutral"
                    }
                  >
                    {row.status}
                  </StatusPill>
                ),
              },
              {
                key: "closedBy",
                header: "Closed By",
                cell: (row) => (
                  <span className="text-slate-600">
                    {row.closedByUser?.name || "—"}
                  </span>
                ),
              },
              {
                key: "closedAt",
                header: "Closed On",
                cell: (row) => (
                  <span className="text-slate-600">
                    {row.closedAt ? format(new Date(row.closedAt), "MMM d, yyyy HH:mm") : "—"}
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
