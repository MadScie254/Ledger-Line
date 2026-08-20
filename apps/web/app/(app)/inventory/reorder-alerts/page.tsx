"use client";
  
import { BellRing } from "lucide-react";
import { DoubleRule, EmptyState } from "@ledgerline/ui";

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="font-serif text-4xl font-semibold text-ink-900">Reorder alerts</h1>
            <p className="mt-3 text-sm text-slate-500">Low-stock signals and follow-up actions.</p>
          </div>
        </div>
        <DoubleRule className="mt-5" />
      </header>
      
      <EmptyState
        icon={<BellRing className="h-5 w-5" />}
        title="Nothing to show"
        body="There is currently no data available for this view."
      />
    </div>
  );
}
