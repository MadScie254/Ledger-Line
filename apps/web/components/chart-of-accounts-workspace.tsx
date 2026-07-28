"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Check, ClipboardList, LoaderCircle, Pencil, Plus, RefreshCw, X } from "lucide-react";
import { Button, DataTable, DoubleRule, EmptyState, Field, Input, Select, StatusPill, type DataTableColumn } from "@ledgerline/ui";

type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "COGS" | "EXPENSE";

interface AccountRecord {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subtype: string | null;
  currency: string;
  isActive: boolean;
  lineCount: number;
}

interface AccountDraft {
  code: string;
  name: string;
  type: AccountType;
  subtype: string;
  isActive: boolean;
}

interface Notice {
  tone: "success" | "danger" | "info";
  message: string;
}

const accountTypes: AccountType[] = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "COGS", "EXPENSE"];
const tutorialStorageKey = "ledgerline.chart-of-accounts.tutorial.dismissed";

export function ChartOfAccountsWorkspace() {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [draft, setDraft] = useState<AccountDraft>(emptyDraft());
  const [editing, setEditing] = useState<AccountRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | AccountType>("ALL");
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [createdInTutorial, setCreatedInTutorial] = useState(false);

  useEffect(() => {
    setTutorialVisible(window.localStorage.getItem(tutorialStorageKey) !== "true");
    void loadAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesType = typeFilter === "ALL" || account.type === typeFilter;
      const matchesQuery = !normalizedQuery || `${account.code} ${account.name} ${account.subtype ?? ""}`.toLowerCase().includes(normalizedQuery);
      return matchesType && matchesQuery;
    });
  }, [accounts, query, typeFilter]);

  const activeAccounts = accounts.filter((account) => account.isActive);
  const columns: DataTableColumn<AccountRecord>[] = [
    { key: "code", header: "Code", cell: (account) => <span className="font-mono text-xs font-semibold tabular-nums">{account.code}</span> },
    { key: "name", header: "Account", cell: (account) => <span className="font-medium">{account.name}</span> },
    { key: "type", header: "Type", cell: (account) => <StatusPill tone={account.type === "ASSET" || account.type === "INCOME" ? "success" : "neutral"}>{formatType(account.type)}</StatusPill> },
    { key: "subtype", header: "Detail type", cell: (account) => <span className="text-slate-500">{account.subtype ?? "-"}</span> },
    { key: "activity", header: "Posting history", align: "right", cell: (account) => <span className="font-mono text-xs tabular-nums text-slate-500">{account.lineCount} lines</span> },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (account) => (
        <Button variant="ghost" size="icon" onClick={() => startEdit(account)} aria-label={`Edit ${account.name}`} title={`Edit ${account.name}`}>
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Ledger core</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Chart of accounts</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">A live, organization-scoped account register. Changes are persisted to Postgres and recorded in the audit log.</p>
          </div>
          <Button variant="primary" onClick={startCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New account
          </Button>
        </div>
        <DoubleRule className="mt-5" />
      </header>

      {tutorialVisible ? (
        <section className="border-y border-slate-200 bg-paper-100/70 px-4 py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-ink-900 text-brass-400">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink-900">Chart setup tutorial</h2>
                <p className="mt-1 text-sm text-slate-500">Start with the accounts that mirror how Akili Traders actually earns, spends, and holds cash.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={startCreate}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {createdInTutorial ? "Add another account" : "Create your first account"}
              </Button>
              <Button variant="ghost" size="sm" onClick={dismissTutorial}>
                {createdInTutorial ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
                {createdInTutorial ? "Complete tutorial" : "Dismiss"}
              </Button>
            </div>
          </div>
          <ol className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <li className="flex gap-2 text-slate-700"><span className="font-mono text-brass-500">01</span><span>Review the seeded operating accounts.</span></li>
            <li className="flex gap-2 text-slate-700"><span className="font-mono text-brass-500">02</span><span>Create the first account unique to your books.</span></li>
            <li className="flex gap-2 text-slate-700"><span className="font-mono text-brass-500">03</span><span>Edit details before the account receives postings.</span></li>
          </ol>
        </section>
      ) : null}

      {notice ? <div role="status" className={`border px-3 py-2 text-sm font-medium ${notice.tone === "success" ? "border-ledger-green-700/20 bg-ledger-green-700/10 text-ledger-green-700" : notice.tone === "danger" ? "border-rust-700/20 bg-rust-700/10 text-rust-700" : "border-focus-blue-500/20 bg-focus-blue-500/10 text-focus-blue-500"}`}>{notice.message}</div> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Active accounts" value={String(activeAccounts.length)} meta="Available for new postings" />
        <Metric label="Account types" value={String(new Set(activeAccounts.map((account) => account.type)).size)} meta="Across the working chart" />
        <Metric label="Posted accounts" value={String(activeAccounts.filter((account) => account.lineCount > 0).length)} meta="Locked against type changes" />
      </section>

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Accounts</h2>
              <p className="mt-1 text-sm text-slate-500">Every row comes from the active organization&apos;s Postgres chart.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search accounts" placeholder="Search accounts" className="w-full md:w-52" />
              <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "ALL" | AccountType)} aria-label="Filter by account type">
                <option value="ALL">All types</option>
                {accountTypes.map((type) => <option key={type} value={type}>{formatType(type)}</option>)}
              </Select>
              <Button variant="secondary" size="icon" onClick={() => void loadAccounts()} aria-label="Refresh accounts" title="Refresh accounts" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center border border-slate-200 bg-white text-sm font-medium text-slate-500">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Loading live chart...
            </div>
          ) : filteredAccounts.length > 0 ? (
            <DataTable columns={columns} data={filteredAccounts} getRowId={(account) => account.id} />
          ) : (
            <EmptyState
              icon={<BookOpenCheck className="h-4 w-4" aria-hidden="true" />}
              title={accounts.length === 0 ? "No accounts found" : "No accounts match the current filters"}
              body={accounts.length === 0 ? "Run the database seed for the demo organization, then create the accounts that match your operating model." : "Clear the filter or create a new account in this category."}
              action={<Button variant="secondary" onClick={startCreate}><Plus className="h-4 w-4" aria-hidden="true" />New account</Button>}
            />
          )}
        </div>

        <aside className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{editing ? "Edit account" : "Account details"}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{editing ? "Updates are audited immediately. Type changes are blocked after posting." : "Choose New account to add a ledger account to the live chart."}</p>
            </div>
            {showForm ? <Button variant="ghost" size="icon" onClick={closeForm} aria-label="Close account form" title="Close"><X className="h-4 w-4" aria-hidden="true" /></Button> : null}
          </div>
          <DoubleRule className="my-4" />
          {showForm ? (
            <form className="grid gap-3" onSubmit={(event) => void saveAccount(event)}>
              <Field label="Account code" hint="Three to eight digits; unique within this organization.">
                <Input value={draft.code} inputMode="numeric" maxLength={8} onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value.replace(/\D/g, "") }))} required />
              </Field>
              <Field label="Account name">
                <Input value={draft.name} maxLength={120} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} required />
              </Field>
              <Field label="Account type">
                <Select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as AccountType }))} disabled={Boolean(editing && editing.lineCount > 0)}>
                  {accountTypes.map((type) => <option key={type} value={type}>{formatType(type)}</option>)}
                </Select>
              </Field>
              <Field label="Detail type" hint="Optional label for local reporting and review.">
                <Input value={draft.subtype} maxLength={100} onChange={(event) => setDraft((current) => ({ ...current, subtype: event.target.value }))} placeholder="e.g. Operating cash" />
              </Field>
              <label className="flex items-center gap-2 text-sm font-medium text-ink-900">
                <input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ink-900 focus:ring-focus-blue-500" />
                Available for new postings
              </label>
              <Button type="submit" variant="accent" disabled={isSaving}>
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                {editing ? "Save account" : "Create account"}
              </Button>
            </form>
          ) : (
            <div className="space-y-3 text-sm text-slate-500">
              <p>Account creation does not post money. Any later journal entry must still pass the ledger service&apos;s exact debit-credit validation.</p>
              <Button variant="secondary" onClick={startCreate}><Plus className="h-4 w-4" aria-hidden="true" />New account</Button>
            </div>
          )}
        </aside>
      </section>
    </div>
  );

  async function loadAccounts() {
    setIsLoading(true);
    setNotice(null);

    try {
      const response = await fetch("/api/accounting/accounts", { cache: "no-store" });
      const payload = await response.json() as { accounts?: AccountRecord[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "The live chart could not be loaded.");
      }

      setAccounts(payload.accounts ?? []);
    } catch (error) {
      setNotice({ tone: "danger", message: error instanceof Error ? error.message : "The live chart could not be loaded." });
    } finally {
      setIsLoading(false);
    }
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      const response = await fetch(editing ? `/api/accounting/accounts/${editing.id}` : "/api/accounting/accounts", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft)
      });
      const payload = await response.json() as { account?: AccountRecord; error?: string };

      if (!response.ok || !payload.account) {
        throw new Error(payload.error ?? "The account could not be saved.");
      }

      const savedAccount = payload.account;
      setAccounts((current) => {
        const next = editing
          ? current.map((account) => account.id === savedAccount.id ? { ...savedAccount, lineCount: account.lineCount } : account)
          : [...current, savedAccount];
        return next.sort((left, right) => left.code.localeCompare(right.code));
      });
      setCreatedInTutorial((created) => created || !editing);
      setNotice({ tone: "success", message: editing ? `${savedAccount.name} was updated and audited.` : `${savedAccount.name} was created and audited.` });
      closeForm();
    } catch (error) {
      setNotice({ tone: "danger", message: error instanceof Error ? error.message : "The account could not be saved." });
    } finally {
      setIsSaving(false);
    }
  }

  function startCreate() {
    setEditing(null);
    setDraft(emptyDraft(nextSuggestedCode(accounts)));
    setShowForm(true);
    setNotice(null);
  }

  function startEdit(account: AccountRecord) {
    setEditing(account);
    setDraft({ code: account.code, name: account.name, type: account.type, subtype: account.subtype ?? "", isActive: account.isActive });
    setShowForm(true);
    setNotice(null);
  }

  function closeForm() {
    setEditing(null);
    setShowForm(false);
  }

  function dismissTutorial() {
    window.localStorage.setItem(tutorialStorageKey, "true");
    setTutorialVisible(false);
  }
}

function Metric({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className="mt-3 font-serif text-3xl font-semibold leading-none text-ink-900">{value}</p>
      <DoubleRule className="my-4" />
      <p className="text-xs font-semibold text-slate-500">{meta}</p>
    </div>
  );
}

function emptyDraft(code = "7000"): AccountDraft {
  return { code, name: "", type: "EXPENSE", subtype: "", isActive: true };
}

function nextSuggestedCode(accounts: AccountRecord[]) {
  const highestCode = accounts.reduce((highest, account) => Math.max(highest, Number.parseInt(account.code, 10) || 0), 6900);
  return String(Math.ceil((highestCode + 1) / 10) * 10);
}

function formatType(type: AccountType) {
  return type === "COGS" ? "Cost of goods sold" : `${type.charAt(0)}${type.slice(1).toLowerCase()}`;
}
