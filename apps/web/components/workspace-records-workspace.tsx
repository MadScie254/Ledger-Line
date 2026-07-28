"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, LoaderCircle, Pencil, Plus, RefreshCw, X } from "lucide-react";
import { Button, DataTable, DoubleRule, EmptyState, Field, Input, Select, StatusPill, type DataTableColumn } from "@ledgerline/ui";
import type { ModuleDefinition } from "@/lib/module-registry";

interface WorkspaceRecord {
  id: string;
  title: string;
  subtitle: string | null;
  status: string | null;
  amountMinor: number | null;
  createdAt: string;
}

interface WorkspaceRecordDraft {
  title: string;
  subtitle: string;
  status: string;
  amountMinor: string;
}

interface Notice {
  tone: "success" | "danger";
  message: string;
}

const statusOptions = ["Draft", "Open", "In review", "Done"];

export function WorkspaceRecordsWorkspace({ definition }: { definition: ModuleDefinition }) {
  const [records, setRecords] = useState<WorkspaceRecord[]>([]);
  const [draft, setDraft] = useState<WorkspaceRecordDraft>(emptyDraft());
  const [editing, setEditing] = useState<WorkspaceRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    void loadRecords();
  }, [definition.moduleKey]);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesQuery = !normalizedQuery || `${record.title} ${record.subtitle ?? ""}`.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "ALL" || (record.status ?? "") === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [records, query, statusFilter]);

  const statusValues = Array.from(new Set(records.map((record) => record.status).filter(Boolean))) as string[];

  const columns: DataTableColumn<WorkspaceRecord>[] = [
    { key: "title", header: "Title", cell: (record) => <span className="font-medium text-ink-900">{record.title}</span> },
    { key: "subtitle", header: "Details", cell: (record) => <span className="text-slate-500">{record.subtitle ?? "-"}</span> },
    {
      key: "status",
      header: "Status",
      cell: (record) => <StatusPill tone={record.status === "Done" ? "success" : "neutral"}>{record.status ?? "Draft"}</StatusPill>
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (record) => <span className="font-mono text-xs text-slate-500">{new Date(record.createdAt).toLocaleDateString()}</span>
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (record) => (
        <Button variant="ghost" size="icon" onClick={() => startEdit(record)} aria-label={`Edit ${record.title}`} title={`Edit ${record.title}`}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Live module</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">{definition.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{definition.description}</p>
          </div>
          <Button variant="primary" onClick={startCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {definition.createLabel}
          </Button>
        </div>
        <DoubleRule className="mt-5" />
      </header>

      {notice ? (
        <div
          role="status"
          className={`border px-3 py-2 text-sm font-medium ${notice.tone === "success" ? "border-ledger-green-700/20 bg-ledger-green-700/10 text-ledger-green-700" : "border-rust-700/20 bg-rust-700/10 text-rust-700"}`}
        >
          {notice.message}
        </div>
      ) : null}

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Records</h2>
              <p className="mt-1 text-sm text-slate-500">List, create, and update records backed by Postgres.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input value={query} onChange={(event) => setQuery(event.target.value)} aria-label={`Search ${definition.title}`} placeholder="Search" className="w-full md:w-56" />
              <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
                <option value="ALL">All statuses</option>
                {[...statusOptions, ...statusValues].filter((value, index, list) => list.indexOf(value) === index).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
              <Button variant="secondary" size="icon" onClick={() => void loadRecords()} aria-label="Refresh records" title="Refresh records" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center border border-slate-200 bg-white text-sm font-medium text-slate-500">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Loading records...
            </div>
          ) : filteredRecords.length > 0 ? (
            <DataTable columns={columns} data={filteredRecords} getRowId={(record) => record.id} />
          ) : (
            <EmptyState
              title="No records found"
              body="Create your first record for this module or import from spreadsheet in Settings > Import."
              action={
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={startCreate}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {definition.createLabel}
                  </Button>
                  <Link
                    href="/settings/import"
                    className="inline-flex h-9 items-center justify-center rounded-[6px] px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-paper-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-blue-500 focus-visible:ring-offset-2"
                  >
                    Import from spreadsheet
                  </Link>
                </div>
              }
            />
          )}
        </div>

        <aside className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{editing ? "Edit record" : "Create record"}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Every submit writes directly to Postgres for the active organization.</p>
            </div>
            {showForm ? (
              <Button variant="ghost" size="icon" onClick={closeForm} aria-label="Close form" title="Close">
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>
          <DoubleRule className="my-4" />

          {showForm ? (
            <form className="grid gap-3" onSubmit={(event) => void saveRecord(event)}>
              <Field label="Title">
                <Input value={draft.title} maxLength={120} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} required />
              </Field>
              <Field label="Details">
                <Input value={draft.subtitle} maxLength={180} onChange={(event) => setDraft((current) => ({ ...current, subtitle: event.target.value }))} />
              </Field>
              <Field label="Status">
                <Select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Amount (minor units)">
                <Input
                  value={draft.amountMinor}
                  inputMode="numeric"
                  onChange={(event) => setDraft((current) => ({ ...current, amountMinor: event.target.value.replace(/[^\d-]/g, "") }))}
                  placeholder="Optional"
                />
              </Field>
              <Button type="submit" variant="accent" disabled={isSaving}>
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                {editing ? "Save changes" : definition.createLabel}
              </Button>
            </form>
          ) : (
            <div className="space-y-3 text-sm text-slate-500">
              <p>Use {definition.createLabel.toLowerCase()} to insert a real row for this route.</p>
              <Button variant="secondary" onClick={startCreate}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {definition.createLabel}
              </Button>
            </div>
          )}
        </aside>
      </section>
    </div>
  );

  async function loadRecords() {
    setIsLoading(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/records/${definition.moduleKey}`, { cache: "no-store" });
      const payload = (await response.json()) as { records?: WorkspaceRecord[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Records could not be loaded.");
      }

      setRecords(payload.records ?? []);
    } catch (error) {
      setNotice({ tone: "danger", message: error instanceof Error ? error.message : "Records could not be loaded." });
    } finally {
      setIsLoading(false);
    }
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      const response = await fetch(editing ? `/api/records/${definition.moduleKey}/${editing.id}` : `/api/records/${definition.moduleKey}`, {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          subtitle: draft.subtitle,
          status: draft.status,
          amountMinor: draft.amountMinor ? Number.parseInt(draft.amountMinor, 10) : null
        })
      });
      const payload = (await response.json()) as { record?: WorkspaceRecord; error?: string };

      if (!response.ok || !payload.record) {
        throw new Error(payload.error ?? "Record could not be saved.");
      }

      const savedRecord = payload.record;
      setRecords((current) => {
        const next = editing
          ? current.map((record) => (record.id === savedRecord.id ? savedRecord : record))
          : [savedRecord, ...current];
        return next;
      });
      setNotice({ tone: "success", message: editing ? "Record updated." : "Record created." });
      closeForm();
    } catch (error) {
      setNotice({ tone: "danger", message: error instanceof Error ? error.message : "Record could not be saved." });
    } finally {
      setIsSaving(false);
    }
  }

  function startCreate() {
    setEditing(null);
    setDraft(emptyDraft());
    setShowForm(true);
    setNotice(null);
  }

  function startEdit(record: WorkspaceRecord) {
    setEditing(record);
    setDraft({
      title: record.title,
      subtitle: record.subtitle ?? "",
      status: record.status ?? "Draft",
      amountMinor: record.amountMinor === null ? "" : String(record.amountMinor)
    });
    setShowForm(true);
    setNotice(null);
  }

  function closeForm() {
    setEditing(null);
    setDraft(emptyDraft());
    setShowForm(false);
  }
}

function emptyDraft(): WorkspaceRecordDraft {
  return {
    title: "",
    subtitle: "",
    status: "Draft",
    amountMinor: ""
  };
}
