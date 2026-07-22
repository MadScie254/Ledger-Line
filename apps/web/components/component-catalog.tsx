import { Banknote, FileText, Plus, ReceiptText, Sparkles, Trash2 } from "lucide-react";
import { Button, CurrencyAmount, DataTable, DoubleRule, EmptyState, Field, Input, Select, StatusPill } from "@ledgerline/ui";
import type { DataTableColumn } from "@ledgerline/ui";

interface CatalogRow {
  id: string;
  code: string;
  account: string;
  type: string;
  balanceMinor: number;
}

const rows: CatalogRow[] = [
  { id: "1000", code: "1000", account: "Equity Bank operating", type: "Asset", balanceMinor: 5_003_50000 },
  { id: "1200", code: "1200", account: "Accounts receivable", type: "Asset", balanceMinor: 412_00000 },
  { id: "2150", code: "2150", account: "VAT payable", type: "Liability", balanceMinor: 310_27600 }
];

const columns: DataTableColumn<CatalogRow>[] = [
  { key: "code", header: "Code", cell: (row) => <span className="font-mono text-xs tabular-nums">{row.code}</span> },
  { key: "account", header: "Account", cell: (row) => row.account },
  { key: "type", header: "Type", cell: (row) => <StatusPill tone="neutral">{row.type}</StatusPill> },
  { key: "balance", header: "Balance", align: "right", cell: (row) => <CurrencyAmount amountMinor={row.balanceMinor} /> }
];

export function ComponentCatalog() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Internal component catalog</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Ledger Look system</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Reusable controls for dense financial workflows, built around ruled sections, precise numbers, and calm interaction states.
        </p>
        <DoubleRule className="mt-5" />
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <h2 className="text-lg font-semibold text-ink-900">Buttons</h2>
          <DoubleRule className="my-4" />
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Primary
            </Button>
            <Button variant="accent">
              <ReceiptText className="h-4 w-4" aria-hidden="true" />
              Accent
            </Button>
            <Button variant="secondary">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Secondary
            </Button>
            <Button variant="danger">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Destructive
            </Button>
          </div>
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <h2 className="text-lg font-semibold text-ink-900">Fields</h2>
          <DoubleRule className="my-4" />
          <div className="grid gap-3">
            <Field label="Invoice number">
              <Input defaultValue="INV-1027" />
            </Field>
            <Field label="Payment method">
              <Select defaultValue="mpesa">
                <option value="mpesa">M-Pesa STK Push</option>
                <option value="bank">Bank transfer</option>
                <option value="card">Card</option>
              </Select>
            </Field>
          </div>
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <h2 className="text-lg font-semibold text-ink-900">Status language</h2>
          <DoubleRule className="my-4" />
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="success">posted</StatusPill>
            <StatusPill tone="warning">review</StatusPill>
            <StatusPill tone="danger">locked</StatusPill>
            <StatusPill tone="info">synced</StatusPill>
            <StatusPill>draft</StatusPill>
          </div>
          <div className="mt-4 rounded-[6px] bg-paper-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Money format</p>
            <CurrencyAmount amountMinor={1_612_00000} className="mt-1 block text-2xl font-semibold" />
          </div>
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
        <h2 className="text-lg font-semibold text-ink-900">Dense data table</h2>
        <DoubleRule className="my-4" />
        <DataTable columns={columns} data={rows} getRowId={(row) => row.id} />
      </section>

      <EmptyState
        icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
        title="No uncategorized transactions"
        body="New bank and M-Pesa feed items will land here for review before anything posts to the ledger."
        action={
          <Button variant="secondary">
            <Banknote className="h-4 w-4" aria-hidden="true" />
            Connect account
          </Button>
        }
      />
    </div>
  );
}
