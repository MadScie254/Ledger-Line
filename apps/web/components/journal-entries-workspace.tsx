"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { LoaderCircle, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button, DataTable, DoubleRule, Field, Input, type DataTableColumn } from "@ledgerline/ui";

interface Account {
  id: string;
  code: string;
  name: string;
}

interface JournalLine {
  id: string;
  accountId: string;
  account?: Account;
  debitMinor: number;
  creditMinor: number;
  description?: string;
}

interface JournalEntry {
  id: string;
  entryDate: string;
  memo?: string;
  referenceNo?: string;
  lines: JournalLine[];
}

export function JournalEntriesWorkspace() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Draft form
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState("");
  const [lines, setLines] = useState<{ accountId: string; debitMinor: string; creditMinor: string }[]>([
    { accountId: "", debitMinor: "", creditMinor: "" },
    { accountId: "", debitMinor: "", creditMinor: "" }
  ]);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [resEntries, resAccounts] = await Promise.all([
        fetch("/api/accounting/journal-entries"),
        fetch("/api/accounting/accounts")
      ]);
      const jsonEntries = await resEntries.json();
      const jsonAccounts = await resAccounts.json();
      
      setEntries(jsonEntries.entries ?? []);
      setAccounts(jsonAccounts.accounts ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  function addLine() {
    setLines([...lines, { accountId: "", debitMinor: "", creditMinor: "" }]);
  }
  
  function removeLine(index: number) {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  }

  function updateLine(index: number, field: keyof typeof lines[0], value: string) {
    const newLines = [...lines];
    const line = newLines[index];
    if (line) {
      line[field] = value;
      // Auto-balance logic helper
      if (field === "debitMinor" && value) line.creditMinor = "";
      if (field === "creditMinor" && value) line.debitMinor = "";
    }
    setLines(newLines);
  }

  async function createEntry(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const parsedLines = lines
        .filter(l => l.accountId && (l.debitMinor || l.creditMinor))
        .map(l => ({
          accountId: l.accountId,
          debitMinor: l.debitMinor ? Number.parseInt(String(l.debitMinor).replace(/\D/g, ""), 10) : 0,
          creditMinor: l.creditMinor ? Number.parseInt(String(l.creditMinor).replace(/\D/g, ""), 10) : 0
        }));

      const res = await fetch("/api/accounting/journal-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryDate: date || new Date().toISOString(),
          memo,
          lines: parsedLines
        })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      setMemo("");
      setDate("");
      setLines([
        { accountId: "", debitMinor: "", creditMinor: "" },
        { accountId: "", debitMinor: "", creditMinor: "" }
      ]);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  const columns: DataTableColumn<JournalEntry>[] = [
    { key: "date", header: "Date", cell: (e) => <span className="font-mono text-xs text-slate-500">{new Date(e.entryDate).toLocaleDateString()}</span> },
    { key: "memo", header: "Memo", cell: (e) => <span className="font-medium text-ink-900">{e.memo || "Manual Entry"}</span> },
    { key: "accounts", header: "Accounts Affected", cell: (e) => (
      <div className="flex gap-1 flex-wrap">
        {e.lines.map((l, idx) => (
          <span key={idx} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
            {l.account?.name || "Unknown"}
          </span>
        ))}
      </div>
    ) },
    { key: "total", header: "Total", align: "right", cell: (e) => {
      const total = e.lines.reduce((sum, l) => sum + (l.debitMinor || 0), 0);
      return <span className="font-mono text-xs text-slate-500">{(total / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
    } }
  ];

  const totalDebit = lines.reduce((sum, l) => sum + (Number.parseInt(l.debitMinor) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number.parseInt(l.creditMinor) || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Accounting</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Journal entries</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Manual journal entries post directly to the ledger. Ensure debits and credits balance.</p>
        <DoubleRule className="mt-5" />
      </header>

      <section className="grid gap-4 xl:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="icon" onClick={() => void loadData()}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center border border-slate-200 bg-white text-sm font-medium text-slate-500">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading journals...
            </div>
          ) : (
            <DataTable columns={columns} data={entries} getRowId={(e) => e.id} />
          )}
        </div>

        <aside className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <h2 className="text-lg font-semibold text-ink-900">Post new entry</h2>
          <DoubleRule className="my-4" />
          <form className="grid gap-4" onSubmit={(e) => void createEntry(e)}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </Field>
              <Field label="Memo">
                <Input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="e.g. Depreciation" required />
              </Field>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-[6px] p-2 bg-slate-50">
              <div className="grid grid-cols-[1fr_80px_80px_32px] gap-2 text-xs font-semibold text-slate-500 px-1">
                <span>Account</span>
                <span className="text-right">Debit</span>
                <span className="text-right">Credit</span>
                <span></span>
              </div>
              
              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_80px_80px_32px] gap-2 items-center">
                  <select 
                    className="h-8 rounded-[4px] border border-slate-200 bg-white px-2 text-xs text-ink-900 outline-none"
                    value={line.accountId}
                    onChange={(e) => updateLine(idx, "accountId", e.target.value)}
                    required
                  >
                    <option value="" disabled>Select...</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                  <Input 
                    placeholder="0" 
                    className="h-8 text-xs text-right font-mono" 
                    value={line.debitMinor}
                    onChange={(e) => updateLine(idx, "debitMinor", e.target.value)}
                  />
                  <Input 
                    placeholder="0" 
                    className="h-8 text-xs text-right font-mono" 
                    value={line.creditMinor}
                    onChange={(e) => updateLine(idx, "creditMinor", e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => removeLine(idx)}
                    className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="pt-2 px-1">
                <button type="button" onClick={addLine} className="text-xs font-semibold text-brass-500 flex items-center gap-1 hover:text-brass-600 transition">
                  <Plus className="h-3 w-3" /> Add line
                </button>
              </div>

              <div className="mt-2 flex justify-end gap-6 border-t border-slate-200 pt-2 px-1 text-xs font-mono font-semibold">
                <span className={totalDebit !== totalCredit ? "text-rust-700" : "text-slate-700"}>Dr: {totalDebit}</span>
                <span className={totalDebit !== totalCredit ? "text-rust-700" : "text-slate-700"}>Cr: {totalCredit}</span>
              </div>
            </div>

            <Button type="submit" variant="accent" disabled={isSaving || !isBalanced}>
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isBalanced ? "Post entry" : "Entry must balance"}
            </Button>
          </form>
        </aside>
      </section>
    </div>
  );
}
