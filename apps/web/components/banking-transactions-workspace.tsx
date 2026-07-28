"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, LoaderCircle, Plus, RefreshCw } from "lucide-react";
import { Button, DataTable, DoubleRule, Field, Input, Select, StatusPill, type DataTableColumn } from "@ledgerline/ui";

interface TransactionRecord {
  id: string;
  description: string;
  date: string;
  status: string;
  direction: "IN" | "OUT";
  amountMinor: number;
  institution: string;
}

interface FeedSignal {
  kind: "spike" | "duplicate";
  title: string;
  detail: string;
  transactionId: string;
}

export function BankingTransactionsWorkspace() {
  const [records, setRecords] = useState<TransactionRecord[]>([]);
  const [signals, setSignals] = useState<FeedSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState({ description: "", amountMinor: "", direction: "OUT", date: "" });

  useEffect(() => {
    void loadRecords();
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return records;
    }

    return records.filter((record) => `${record.description} ${record.status} ${record.institution}`.toLowerCase().includes(normalized));
  }, [records, query]);

  const columns: DataTableColumn<TransactionRecord>[] = [
    { key: "date", header: "Date", cell: (record) => <span className="font-mono text-xs text-slate-500">{record.date}</span> },
    { key: "description", header: "Description", cell: (record) => <span className="font-medium text-ink-900">{record.description}</span> },
    { key: "institution", header: "Institution", cell: (record) => record.institution },
    { key: "direction", header: "Direction", cell: (record) => <StatusPill tone={record.direction === "IN" ? "success" : "warning"}>{record.direction}</StatusPill> },
    { key: "status", header: "Status", cell: (record) => <StatusPill>{record.status}</StatusPill> },
    { key: "amountMinor", header: "Amount", align: "right", cell: (record) => <span className="font-mono text-xs text-slate-500">{record.amountMinor.toLocaleString()}</span> }
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Banking</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Bank transactions</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Live transaction feed with proactive duplicate and amount-spike signals.</p>
        <DoubleRule className="mt-5" />
      </header>

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions" className="w-full md:w-72" />
            <Button variant="secondary" size="icon" onClick={() => void loadRecords()}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center border border-slate-200 bg-white text-sm font-medium text-slate-500">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Loading feed...
            </div>
          ) : (
            <DataTable columns={columns} data={filtered} getRowId={(record) => record.id} />
          )}

          <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
            <h2 className="text-lg font-semibold text-ink-900">Proactive signals</h2>
            <p className="mt-1 text-sm text-slate-500">Automatically surfaced risk events from the transaction stream.</p>
            <div className="mt-3 space-y-2">
              {signals.length === 0 ? <p className="text-sm text-slate-500">No anomalies detected.</p> : null}
              {signals.map((signal) => (
                <div key={`${signal.kind}-${signal.transactionId}`} className="rounded-[6px] border border-amber-200 bg-amber-50 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />{signal.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{signal.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <h2 className="text-lg font-semibold text-ink-900">Add transaction</h2>
          <p className="mt-1 text-sm text-slate-500">Manual transaction entry for reconciliation workflows.</p>
          <DoubleRule className="my-4" />
          <form className="grid gap-3" onSubmit={(event) => void createRecord(event)}>
            <Field label="Description">
              <Input value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} required />
            </Field>
            <Field label="Amount (minor units)">
              <Input value={draft.amountMinor} inputMode="numeric" onChange={(event) => setDraft((current) => ({ ...current, amountMinor: event.target.value.replace(/\D/g, "") }))} required />
            </Field>
            <Field label="Direction">
              <Select value={draft.direction} onChange={(event) => setDraft((current) => ({ ...current, direction: event.target.value as "IN" | "OUT" }))}>
                <option value="OUT">OUT</option>
                <option value="IN">IN</option>
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
            </Field>
            <Button type="submit" variant="accent" disabled={isSaving}>
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              Save transaction
            </Button>
          </form>
        </aside>
      </section>
    </div>
  );

  async function loadRecords() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/banking/transactions", { cache: "no-store" });
      const payload = (await response.json()) as { records?: TransactionRecord[]; signals?: FeedSignal[] };
      setRecords(payload.records ?? []);
      setSignals(payload.signals ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  async function createRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/banking/transactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          description: draft.description,
          amountMinor: Number.parseInt(draft.amountMinor, 10),
          direction: draft.direction,
          date: draft.date
        })
      });
      const payload = (await response.json()) as { record?: TransactionRecord; error?: string };

      if (!response.ok || !payload.record) {
        throw new Error(payload.error ?? "Transaction could not be created.");
      }

      setRecords((current) => [payload.record as TransactionRecord, ...current]);
      setDraft({ description: "", amountMinor: "", direction: "OUT", date: "" });
      await loadRecords();
    } finally {
      setIsSaving(false);
    }
  }
}
