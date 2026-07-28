"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Check, LoaderCircle, Pencil, Plus, RefreshCw, X } from "lucide-react";
import { Button, DataTable, DoubleRule, EmptyState, Field, Input, Select, StatusPill, type DataTableColumn } from "@ledgerline/ui";

interface EntityRecord {
  id: string;
  title: string;
  subtitle: string | null;
  status: string | null;
  amountMinor: number | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

type FieldType = "text" | "number" | "date";

interface FormField {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  hint?: string;
  placeholder?: string;
}

interface EntityWorkspaceProps {
  title: string;
  description: string;
  createLabel: string;
  endpoint: string;
  fields: FormField[];
}

interface Notice {
  tone: "success" | "danger";
  message: string;
}

interface EntityListResponse {
  records?: EntityRecord[];
  error?: string;
  source?: "live" | "demo";
}

export function SimpleEntityWorkspace({ title, description, createLabel, endpoint, fields }: EntityWorkspaceProps) {
  const [records, setRecords] = useState<EntityRecord[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<EntityRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setDraft(buildEmptyDraft(fields));
    void loadRecords();
  }, [endpoint]);

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return records;
    }

    return records.filter((record) => `${record.title} ${record.subtitle ?? ""} ${record.status ?? ""}`.toLowerCase().includes(normalized));
  }, [records, query]);

  const columns: DataTableColumn<EntityRecord>[] = [
    { key: "title", header: "Title", cell: (row) => <span className="font-medium text-ink-900">{row.title}</span> },
    { key: "subtitle", header: "Details", cell: (row) => <span className="text-slate-500">{row.subtitle ?? "-"}</span> },
    { key: "status", header: "Status", cell: (row) => <StatusPill tone={row.status === "PAID" || row.status === "Done" ? "success" : "neutral"}>{row.status ?? "Draft"}</StatusPill> },
    {
      key: "amountMinor",
      header: "Amount",
      align: "right",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500">{typeof row.amountMinor === "number" ? row.amountMinor.toLocaleString() : "-"}</span>
      )
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (row) => (
        <Button variant="ghost" size="icon" onClick={() => startEdit(row)} aria-label={`Edit ${row.title}`} title={`Edit ${row.title}`}>
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
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
          </div>
          <Button variant="primary" onClick={startCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {createLabel}
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
              <p className="mt-1 text-sm text-slate-500">Live rows from Postgres with direct create and edit.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input value={query} onChange={(event) => setQuery(event.target.value)} aria-label={`Search ${title}`} placeholder="Search" className="w-full md:w-56" />
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
              body="Create your first record for this module."
              action={
                <Button variant="secondary" onClick={startCreate}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {createLabel}
                </Button>
              }
            />
          )}
        </div>

        <aside className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{editing ? "Edit record" : "Create record"}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Submit writes directly to the live database.</p>
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
              {fields.map((field) => (
                <Field key={field.key} label={field.label} hint={field.hint}>
                  <Input
                    type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                    inputMode={field.type === "number" ? "numeric" : undefined}
                    value={draft[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                    required={field.required}
                  />
                </Field>
              ))}
              <Button type="submit" variant="accent" disabled={isSaving}>
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                {editing ? "Save changes" : createLabel}
              </Button>
            </form>
          ) : (
            <div className="space-y-3 text-sm text-slate-500">
              <p>Use {createLabel.toLowerCase()} to insert a real row for this route.</p>
              <Button variant="secondary" onClick={startCreate}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {createLabel}
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
      const response = await fetch(endpoint, { cache: "no-store" });
      const payload = (await response.json()) as EntityListResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Records could not be loaded.");
      }

      setRecords(payload.records ?? []);

      if (payload.source === "demo") {
        setNotice({ tone: "danger", message: "Local database unavailable. Showing demo records." });
      }
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
      const body: Record<string, unknown> = {};

      for (const field of fields) {
        const value = draft[field.key] ?? "";

        if (field.type === "number") {
          body[field.key] = value.trim() ? Number.parseInt(value, 10) : null;
        } else {
          body[field.key] = value;
        }
      }

      const response = await fetch(editing ? `${endpoint}/${editing.id}` : endpoint, {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = (await response.json()) as { record?: EntityRecord; error?: string };

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
    setDraft(buildEmptyDraft(fields));
    setShowForm(true);
    setNotice(null);
  }

  function startEdit(record: EntityRecord) {
    setEditing(record);
    const nextDraft = buildEmptyDraft(fields);

    for (const field of fields) {
      if (field.key === "title") {
        nextDraft[field.key] = record.title;
      } else if (field.key === "subtitle") {
        nextDraft[field.key] = record.subtitle ?? "";
      } else if (field.key === "status") {
        nextDraft[field.key] = record.status ?? "";
      } else if (field.key === "amountMinor") {
        nextDraft[field.key] = typeof record.amountMinor === "number" ? String(record.amountMinor) : "";
      } else {
        const metadataValue = record.metadata?.[field.key];
        nextDraft[field.key] = typeof metadataValue === "string" || typeof metadataValue === "number" ? String(metadataValue) : "";
      }
    }

    setDraft(nextDraft);
    setShowForm(true);
    setNotice(null);
  }

  function closeForm() {
    setEditing(null);
    setDraft(buildEmptyDraft(fields));
    setShowForm(false);
  }
}

function buildEmptyDraft(fields: FormField[]) {
  const draft: Record<string, string> = {};

  for (const field of fields) {
    draft[field.key] = "";
  }

  return draft;
}
