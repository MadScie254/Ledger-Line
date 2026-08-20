"use client";
  
import { FolderOpen, Plus } from "lucide-react";
import { Button, DoubleRule, EmptyState } from "@ledgerline/ui";

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="font-serif text-4xl font-semibold text-ink-900">Projects</h1>
            <p className="mt-3 text-sm text-slate-500">Organize work and track profitability by project.</p>
          </div>
        </div>
        <DoubleRule className="mt-5" />
      </header>
      
      <EmptyState
        icon={<FolderOpen className="h-5 w-5" />}
        title="No records found"
        body="This section is currently empty. Get started by creating your first record."
        action={
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        }
      />
    </div>
  );
}
