"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { Button, DataTable, DoubleRule, Input, type DataTableColumn } from "@ledgerline/ui";

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  user: string;
  createdAt: string;
  diff: unknown;
}

export function AuditLogWorkspace() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void loadEntries();
  }, []);

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return entries;
    }

    return entries.filter((entry) => `${entry.action} ${entry.entityType} ${entry.entityId} ${entry.user}`.toLowerCase().includes(normalized));
  }, [entries, query]);

  const columns: DataTableColumn<AuditEntry>[] = [
    { key: "createdAt", header: "Timestamp", cell: (entry) => <span className="font-mono text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span> },
    { key: "action", header: "Action", cell: (entry) => <span className="font-medium text-ink-900">{entry.action}</span> },
    { key: "entityType", header: "Entity", cell: (entry) => `${entry.entityType} · ${entry.entityId.slice(0, 8)}` },
    { key: "user", header: "User", cell: (entry) => entry.user },
    { key: "diff", header: "Diff", cell: (entry) => <span className="text-xs text-slate-500">{truncate(JSON.stringify(entry.diff), 80)}</span> }
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Compliance</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Consolidated audit log</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Cross-module immutable audit events with filterable timeline.</p>
        <DoubleRule className="mt-5" />
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search action, entity, user" className="w-full md:w-80" />
          <Button variant="secondary" size="icon" onClick={() => void loadEntries()} title="Refresh" aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center border border-slate-200 bg-white text-sm font-medium text-slate-500">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Loading audit log...
          </div>
        ) : (
          <DataTable columns={columns} data={filteredEntries} getRowId={(entry) => entry.id} />
        )}
      </section>
    </div>
  );

  async function loadEntries() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/settings/audit-log", { cache: "no-store" });
      const payload = (await response.json()) as { entries?: AuditEntry[] };
      setEntries(payload.entries ?? []);
    } finally {
      setIsLoading(false);
    }
  }
}

function truncate(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max)}...`;
}
