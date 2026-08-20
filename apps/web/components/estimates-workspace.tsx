"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { LoaderCircle, Plus, RefreshCw } from "lucide-react";
import { Button, DataTable, DoubleRule, Field, Input, StatusPill, type DataTableColumn } from "@ledgerline/ui";

interface EstimateLine {
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

interface Estimate {
  id: string;
  estimateNo: string;
  issueDate: string;
  expiryDate?: string;
  status: string;
  currency: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  customer?: { name: string };
  lines: EstimateLine[];
}

const STATUS_TONE: Record<string, "success" | "warning" | "info" | "danger" | "neutral"> = {
  DRAFT: "warning",
  SENT: "info",
  ACCEPTED: "success",
  DECLINED: "danger",
  EXPIRED: "neutral",
};

export function EstimatesWorkspace() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState({
    customerId: "",
    estimateNo: "",
    issueDate: "",
    expiryDate: "",
    message: "",
    lineDesc: "",
    lineQty: "1",
    lineUnitPrice: "",
  });

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setIsLoading(true);
    try {
      const [resEst, resCust] = await Promise.all([
        fetch("/api/sales/estimates"),
        fetch("/api/records/sales-customers"),
      ]);
      const estJson = await resEst.json();
      const custJson = await resCust.json();
      setEstimates(estJson.estimates ?? []);
      setCustomers(custJson.records ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  async function createEstimate(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/sales/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: draft.customerId,
          estimateNo: draft.estimateNo,
          issueDate: draft.issueDate,
          expiryDate: draft.expiryDate || null,
          message: draft.message,
          lines: [
            {
              description: draft.lineDesc,
              qty: Number.parseFloat(draft.lineQty) || 1,
              unitPrice: Number.parseFloat(draft.lineUnitPrice) || 0,
            },
          ],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDraft({ customerId: "", estimateNo: "", issueDate: "", expiryDate: "", message: "", lineDesc: "", lineQty: "1", lineUnitPrice: "" });
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  const columns: DataTableColumn<Estimate>[] = [
    {
      key: "estimateNo",
      header: "Estimate #",
      cell: (e) => <span className="font-mono text-xs font-semibold text-ink-900">{e.estimateNo}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      cell: (e) => e.customer?.name ?? "—",
    },
    {
      key: "issueDate",
      header: "Issue date",
      cell: (e) => <span className="font-mono text-xs text-slate-500">{new Date(e.issueDate).toLocaleDateString()}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (e) => <StatusPill tone={STATUS_TONE[e.status] ?? "info"}>{e.status}</StatusPill>,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (e) => (
        <span className="font-mono text-xs text-slate-700">
          {Number(e.total).toLocaleString("en-KE", { style: "currency", currency: e.currency || "KES" })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Sales</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Estimates</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Create and manage customer estimates. Accepted estimates can be converted to invoices.
        </p>
        <DoubleRule className="mt-5" />
      </header>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" onClick={() => void load()}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center border border-slate-200 bg-white text-sm font-medium text-slate-500">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading estimates...
            </div>
          ) : (
            <DataTable columns={columns} data={estimates} getRowId={(e) => e.id} />
          )}
        </div>

        <aside className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <h2 className="text-lg font-semibold text-ink-900">New estimate</h2>
          <DoubleRule className="my-4" />

          <form className="grid gap-3" onSubmit={(e) => void createEstimate(e)}>
            <Field label="Customer">
              <select
                className="h-9 w-full rounded-[4px] border border-slate-200 bg-white px-2 text-sm text-ink-900 outline-none"
                value={draft.customerId}
                onChange={(e) => setDraft((d) => ({ ...d, customerId: e.target.value }))}
                required
              >
                <option value="" disabled>Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Estimate #">
                <Input value={draft.estimateNo} onChange={(e) => setDraft((d) => ({ ...d, estimateNo: e.target.value }))} placeholder="EST-001" required />
              </Field>
              <Field label="Issue date">
                <Input type="date" value={draft.issueDate} onChange={(e) => setDraft((d) => ({ ...d, issueDate: e.target.value }))} required />
              </Field>
            </div>

            <Field label="Expiry date">
              <Input type="date" value={draft.expiryDate} onChange={(e) => setDraft((d) => ({ ...d, expiryDate: e.target.value }))} />
            </Field>

            <div className="rounded-[6px] border border-slate-200 bg-slate-50 p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Line item</p>
              <Field label="Description">
                <Input value={draft.lineDesc} onChange={(e) => setDraft((d) => ({ ...d, lineDesc: e.target.value }))} required />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Qty">
                  <Input type="number" min="1" step="0.01" value={draft.lineQty} onChange={(e) => setDraft((d) => ({ ...d, lineQty: e.target.value }))} required />
                </Field>
                <Field label="Unit price">
                  <Input inputMode="decimal" value={draft.lineUnitPrice} onChange={(e) => setDraft((d) => ({ ...d, lineUnitPrice: e.target.value }))} required />
                </Field>
              </div>
            </div>

            <Field label="Message (optional)">
              <Input value={draft.message} onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))} placeholder="Thank you for your business" />
            </Field>

            <Button type="submit" variant="accent" disabled={isSaving}>
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create estimate
            </Button>
          </form>
        </aside>
      </section>
    </div>
  );
}
