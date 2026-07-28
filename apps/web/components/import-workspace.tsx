"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Check, LoaderCircle, RefreshCw, RotateCcw, Upload } from "lucide-react";
import { Button, DataTable, DoubleRule, Field, Input, Select, type DataTableColumn } from "@ledgerline/ui";

type ImportTarget = "accounts" | "customers" | "vendors" | "products" | "invoices" | "opening_balances";

interface ImportBatch {
  id: string;
  targetType: string;
  fileName: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  status: string;
  importedBy: string;
  createdAt: string;
  reversedAt: string | null;
}

interface PreviewRow {
  rowIndex: number;
  valid: boolean;
  errors: string[];
  mapped: Record<string, unknown>;
}

const targetFields: Record<ImportTarget, Array<{ key: string; label: string; required?: boolean }>> = {
  accounts: [
    { key: "code", label: "Account code", required: true },
    { key: "name", label: "Account name", required: true },
    { key: "type", label: "Account type", required: true },
    { key: "subtype", label: "Subtype" }
  ],
  customers: [
    { key: "displayName", label: "Customer name", required: true },
    { key: "companyName", label: "Company" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" }
  ],
  vendors: [
    { key: "displayName", label: "Vendor name", required: true },
    { key: "category", label: "Category" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" }
  ],
  products: [
    { key: "name", label: "Product name", required: true },
    { key: "sku", label: "SKU" },
    { key: "salesPriceMinor", label: "Sales price (minor units)" },
    { key: "costMinor", label: "Cost (minor units)" },
    { key: "qtyOnHand", label: "Quantity on hand" }
  ],
  invoices: [
    { key: "invoiceNo", label: "Invoice number", required: true },
    { key: "customerName", label: "Customer name", required: true },
    { key: "totalMinor", label: "Total (minor units)", required: true },
    { key: "issueDate", label: "Issue date" },
    { key: "dueDate", label: "Due date" }
  ],
  opening_balances: [
    { key: "entryKey", label: "Entry key", required: true },
    { key: "entryDate", label: "Entry date" },
    { key: "memo", label: "Memo" },
    { key: "accountCode", label: "Account code", required: true },
    { key: "debitMinor", label: "Debit (minor units)" },
    { key: "creditMinor", label: "Credit (minor units)" },
    { key: "description", label: "Description" }
  ]
};

export function ImportWorkspace() {
  const [targetType, setTargetType] = useState<ImportTarget>("accounts");
  const [fileName, setFileName] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isCommitting, setIsCommitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadHistory();
  }, []);

  const preview = useMemo(() => {
    const fields = targetFields[targetType];

    return rows.map((row, index) => {
      const mapped: Record<string, unknown> = {};
      const errors: string[] = [];

      for (const field of fields) {
        const matchedHeader = Object.entries(mapping).find(([, mappedField]) => mappedField === field.key)?.[0];
        const value = matchedHeader ? row[matchedHeader] : undefined;

        if (field.required && (value === undefined || value === null || `${value}`.trim() === "")) {
          errors.push(`${field.label} is required.`);
        }

        if (field.key.endsWith("Minor") && value !== undefined && value !== null && `${value}`.trim() !== "" && !Number.isFinite(Number(value))) {
          errors.push(`${field.label} must be numeric.`);
        }

        mapped[field.key] = coerceValue(field.key, value);
      }

      return {
        rowIndex: index + 1,
        valid: errors.length === 0,
        errors,
        mapped
      } satisfies PreviewRow;
    });
  }, [mapping, rows, targetType]);

  const canCommit = preview.length > 0 && preview.every((row) => row.valid);

  const previewColumns: DataTableColumn<PreviewRow>[] = [
    { key: "row", header: "Row", cell: (row) => <span className="font-mono text-xs text-slate-500">{row.rowIndex}</span> },
    { key: "status", header: "Status", cell: (row) => row.valid ? <span className="text-xs font-semibold text-ledger-green-700">Pass</span> : <span className="text-xs font-semibold text-rust-700">Fail</span> },
    { key: "errors", header: "Validation", cell: (row) => row.errors.length === 0 ? "Ready" : row.errors.join(" ") },
    { key: "mapped", header: "Mapped values", cell: (row) => <span className="text-xs text-slate-500">{JSON.stringify(row.mapped)}</span> }
  ];

  const batchColumns: DataTableColumn<ImportBatch>[] = [
    { key: "createdAt", header: "Imported", cell: (batch) => new Date(batch.createdAt).toLocaleString() },
    { key: "targetType", header: "Target", cell: (batch) => batch.targetType },
    { key: "fileName", header: "File", cell: (batch) => batch.fileName },
    { key: "rows", header: "Rows", cell: (batch) => `${batch.successRows}/${batch.totalRows}` },
    { key: "status", header: "Status", cell: (batch) => batch.status },
    {
      key: "actions",
      header: "Actions",
      cell: (batch) => (
        <Button variant="ghost" size="sm" onClick={() => void reverseBatch(batch.id)} disabled={batch.status === "reversed"}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reverse
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Data onboarding</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Universal importer</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Upload CSV/XLSX, map columns, validate rows, commit in one transaction, and reverse import batches.</p>
        <DoubleRule className="mt-5" />
      </header>

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Import target">
                <Select value={targetType} onChange={(event) => setTargetType(event.target.value as ImportTarget)}>
                  <option value="accounts">Chart of Accounts</option>
                  <option value="customers">Customers</option>
                  <option value="vendors">Vendors</option>
                  <option value="products">Products/Items</option>
                  <option value="invoices">Invoices</option>
                  <option value="opening_balances">Opening Balances (Journal)</option>
                </Select>
              </Field>
              <Field label="Upload file">
                <Input type="file" accept=".csv,.xlsx" onChange={(event) => void handleFile(event)} />
              </Field>
            </div>

            {headers.length > 0 ? (
              <div className="mt-4 grid gap-3">
                <h2 className="text-sm font-semibold text-ink-900">Column mapping</h2>
                {headers.map((header) => (
                  <div key={header} className="grid grid-cols-[minmax(0,1fr)_220px] items-center gap-3">
                    <p className="truncate text-sm text-slate-600">{header}</p>
                    <Select value={mapping[header] ?? ""} onChange={(event) => setMapping((current) => ({ ...current, [header]: event.target.value }))}>
                      <option value="">Ignore</option>
                      {targetFields[targetType].map((field) => (
                        <option key={field.key} value={field.key}>{field.label}</option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>
            ) : null}

            {message ? <p className="mt-3 text-sm font-medium text-ink-900">{message}</p> : null}
          </div>

          {preview.length > 0 ? (
            <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink-900">Validation preview</h2>
                <Button variant="accent" size="sm" onClick={() => void commit()} disabled={!canCommit || isCommitting}>
                  {isCommitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                  Commit import
                </Button>
              </div>
              <DataTable columns={previewColumns} data={preview.slice(0, 150)} getRowId={(row) => String(row.rowIndex)} />
            </div>
          ) : null}
        </div>

        <aside className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-900">Import history</h2>
            <Button variant="secondary" size="icon" onClick={() => void loadHistory()}>
              <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? "animate-spin" : ""}`} aria-hidden="true" />
            </Button>
          </div>
          {isLoadingHistory ? (
            <div className="flex min-h-28 items-center justify-center text-sm text-slate-500">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Loading history...
            </div>
          ) : (
            <DataTable columns={batchColumns} data={batches} getRowId={(batch) => batch.id} />
          )}
        </aside>
      </section>
    </div>
  );

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setMessage(null);

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "csv") {
      const text = await file.text();
      const parsed = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true });
      applyParsedRows(parsed.meta.fields ?? [], parsed.data);
      return;
    }

    if (extension === "xlsx") {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) {
        setMessage("The workbook has no sheets.");
        return;
      }
      const worksheet = workbook.Sheets[firstSheet];
      if (!worksheet) {
        setMessage("The first sheet could not be loaded.");
        return;
      }
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });
      const headerSet = new Set<string>();
      for (const row of json) {
        Object.keys(row).forEach((key) => headerSet.add(key));
      }
      applyParsedRows(Array.from(headerSet), json);
      return;
    }

    setMessage("Unsupported file type. Upload CSV or XLSX.");
  }

  function applyParsedRows(nextHeaders: string[], nextRows: Array<Record<string, unknown>>) {
    setHeaders(nextHeaders);
    setRows(nextRows);

    const initialMapping: Record<string, string> = {};
    for (const header of nextHeaders) {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "");
      const match = targetFields[targetType].find((field) => field.key.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedHeader);
      if (match) {
        initialMapping[header] = match.key;
      }
    }

    setMapping(initialMapping);
    setMessage(`${nextRows.length} rows parsed from ${fileName || "file"}.`);
  }

  async function commit() {
    if (!canCommit) {
      setMessage("Fix validation errors before committing.");
      return;
    }

    setIsCommitting(true);

    try {
      const commitRows = preview.map((row) => row.mapped);
      const response = await fetch("/api/settings/import/batches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          targetType,
          fileName,
          rows: commitRows
        })
      });

      const payload = (await response.json()) as { error?: string; batch?: ImportBatch };
      if (!response.ok) {
        throw new Error(payload.error ?? "Commit failed.");
      }

      setMessage(`Import committed: ${payload.batch?.successRows ?? commitRows.length} rows.`);
      setRows([]);
      setHeaders([]);
      setMapping({});
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Commit failed.");
    } finally {
      setIsCommitting(false);
    }
  }

  async function loadHistory() {
    setIsLoadingHistory(true);

    try {
      const response = await fetch("/api/settings/import/batches", { cache: "no-store" });
      const payload = (await response.json()) as { batches?: ImportBatch[] };
      setBatches(payload.batches ?? []);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function reverseBatch(batchId: string) {
    setMessage(null);

    const response = await fetch(`/api/settings/import/batches/${batchId}/reverse`, { method: "POST" });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "Reverse failed.");
      return;
    }

    setMessage("Import reversed successfully.");
    await loadHistory();
  }
}

function coerceValue(fieldKey: string, value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  const raw = `${value}`.trim();
  if (!raw) {
    return null;
  }

  if (fieldKey.endsWith("Minor") || fieldKey === "qtyOnHand") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : raw;
  }

  return raw;
}
