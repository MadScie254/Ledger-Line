"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button, DataTable, StatusPill } from "@ledgerline/ui";
import { Landmark, Plus } from "lucide-react";
import { formatMoneyMinor } from "@ledgerline/ledger-service";

interface BankConnection {
  id: string;
  institutionName: string;
  accountNoMasked: string;
  currency: string;
  provider: string;
  lastSyncedAt: string | null;
  currentBalance: string; // Decimal returned as string
}

export function BankingConnectionsWorkspace() {
  const { data: connections, isLoading, error } = useQuery<BankConnection[]>({
    queryKey: ["bank-connections"],
    queryFn: () => fetch("/api/banking/connections").then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500">
        Loading bank connections...
      </div>
    );
  }

  if (error || !connections) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-rust-700">
        <p className="font-semibold">Failed to load bank connections</p>
        <p className="text-sm">{error?.message || "Unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-serif">Bank Connections</h1>
          <p className="text-sm text-slate-500">Manage connected bank accounts and mobile-money channels.</p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="h-4 w-4" />
          Connect bank
        </Button>
      </div>

      <div className="flex-1 rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {connections.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-paper-100">
              <Landmark className="h-5 w-5 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-ink-900">No banks connected</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              You haven&apos;t connected any bank or mobile-money accounts yet.
            </p>
          </div>
        ) : (
          <DataTable
            data={connections}
            getRowId={(row) => row.id}
            columns={[
              {
                key: "institution",
                header: "Institution",
                cell: (row) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-paper-50 text-slate-500">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-ink-900">{row.institutionName}</div>
                      <div className="text-xs text-slate-500 font-mono tracking-widest">{row.accountNoMasked}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: (row) => (
                  <StatusPill tone="success">
                    Connected
                  </StatusPill>
                ),
              },
              {
                key: "lastSyncedAt",
                header: "Last Synced",
                cell: (row) => (
                  <span className="text-slate-600 text-sm">
                    {row.lastSyncedAt ? format(new Date(row.lastSyncedAt), "MMM d, yyyy HH:mm") : "Never"}
                  </span>
                ),
              },
              {
                key: "balance",
                header: "Current Balance",
                cell: (row) => (
                  <span className="font-semibold text-ink-900 font-mono">
                    {formatMoneyMinor(Math.round(Number(row.currentBalance) * 100), row.currency)}
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
