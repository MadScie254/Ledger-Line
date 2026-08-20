"use client";

import { useQuery } from "@tanstack/react-query";
import { Button, DataTable, StatusPill } from "@ledgerline/ui";
import { FileCode2, Plus } from "lucide-react";

interface BankRule {
  id: string;
  matchConditions: any;
  actions: any;
  priority: number;
}

export function BankingRulesWorkspace() {
  const { data: rules, isLoading, error } = useQuery<BankRule[]>({
    queryKey: ["bank-rules"],
    queryFn: () => fetch("/api/banking/rules").then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500">
        Loading bank rules...
      </div>
    );
  }

  if (error || !rules) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-rust-700">
        <p className="font-semibold">Failed to load bank rules</p>
        <p className="text-sm">{error?.message || "Unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-serif">Bank Rules</h1>
          <p className="text-sm text-slate-500">Automate transaction categorization with matching rules.</p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="h-4 w-4" />
          Create rule
        </Button>
      </div>

      <div className="flex-1 rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {rules.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-paper-100">
              <FileCode2 className="h-5 w-5 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-ink-900">No rules created</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              You haven&apos;t created any bank rules yet. Create a rule to automatically categorize frequent transactions.
            </p>
          </div>
        ) : (
          <DataTable
            data={rules}
            getRowId={(row) => row.id}
            columns={[
              {
                key: "priority",
                header: "Priority",
                cell: (row) => <span className="font-medium text-slate-500">{row.priority}</span>,
              },
              {
                key: "conditions",
                header: "Match Conditions",
                cell: (row) => (
                  <span className="font-medium text-ink-900 truncate max-w-sm inline-block">
                    {JSON.stringify(row.matchConditions)}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                cell: (row) => (
                  <span className="text-slate-600 truncate max-w-sm inline-block">
                    {JSON.stringify(row.actions)}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                cell: () => (
                  <StatusPill tone="success">
                    Active
                  </StatusPill>
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
