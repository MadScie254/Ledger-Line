"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { LoaderCircle, Plus, RefreshCw, User } from "lucide-react";
import { Button, DataTable, DoubleRule, Field, Input, Select, StatusPill, type DataTableColumn } from "@ledgerline/ui";
import { formatMoneyMinor } from "@/lib/format-money";

interface Employee {
  id: string;
  name: string;
  nationalId?: string;
  kraPin?: string;
  nssfNo?: string;
  shifNo?: string;
  salaryStructure: { baseSalaryMinor?: number };
  payFrequency: string;
  status: string;
}

export function EmployeesWorkspace({ baseCurrency = "KES" }: { baseCurrency?: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState({
    name: "",
    nationalId: "",
    baseSalaryMinor: "",
    payFrequency: "MONTHLY",
    kraPin: "",
    nssfNo: "",
    shifNo: "",
  });

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payroll/employees");
      const json = await res.json();
      setEmployees(json.employees ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  async function createEmployee(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/payroll/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          baseSalaryMinor: Number.parseInt(draft.baseSalaryMinor, 10) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDraft({ name: "", nationalId: "", baseSalaryMinor: "", payFrequency: "MONTHLY", kraPin: "", nssfNo: "", shifNo: "" });
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  const filtered = employees.filter(
    (e) => !query || e.name.toLowerCase().includes(query.toLowerCase())
  );

  const columns: DataTableColumn<Employee>[] = [
    {
      key: "name",
      header: "Employee",
      cell: (e) => (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brass-100 text-brass-700">
            <User className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="font-medium text-ink-900">{e.name}</p>
            <p className="text-xs text-slate-500">{e.nationalId ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "payFrequency",
      header: "Pay frequency",
      cell: (e) => <StatusPill tone="info">{e.payFrequency}</StatusPill>,
    },
    {
      key: "status",
      header: "Status",
      cell: (e) => <StatusPill tone={e.status === "ACTIVE" ? "success" : "warning"}>{e.status}</StatusPill>,
    },
    {
      key: "salary",
      header: "Base salary",
      align: "right",
      cell: (e) => (
        <span className="font-mono text-xs text-slate-700">
          {formatMoneyMinor(e.salaryStructure?.baseSalaryMinor ?? 0, baseCurrency)}
        </span>
      ),
    },
    {
      key: "kraPin",
      header: "KRA PIN",
      cell: (e) => <span className="font-mono text-xs text-slate-500">{e.kraPin || "—"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Payroll</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Employees</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Manage your team's payroll profile including salary, pay frequency, and statutory IDs (KRA, NSSF, SHIF).
        </p>
        <DoubleRule className="mt-5" />
      </header>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employees"
              className="w-full md:w-72"
            />
            <Button variant="secondary" size="icon" onClick={() => void load()}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center border border-slate-200 bg-white text-sm font-medium text-slate-500">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading employees...
            </div>
          ) : (
            <DataTable columns={columns} data={filtered} getRowId={(e) => e.id} />
          )}
        </div>

        <aside className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-ledger">
          <h2 className="text-lg font-semibold text-ink-900">Add employee</h2>
          <p className="mt-1 text-sm text-slate-500">Fill in payroll and statutory details.</p>
          <DoubleRule className="my-4" />

          <form className="grid gap-3" onSubmit={(e) => void createEmployee(e)}>
            <Field label="Full name">
              <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} required />
            </Field>
            <Field label="National ID">
              <Input value={draft.nationalId} onChange={(e) => setDraft((d) => ({ ...d, nationalId: e.target.value }))} />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Base salary (KES cents)">
                <Input
                  inputMode="numeric"
                  value={draft.baseSalaryMinor}
                  onChange={(e) => setDraft((d) => ({ ...d, baseSalaryMinor: e.target.value.replace(/\D/g, "") }))}
                  placeholder="e.g. 500000"
                />
              </Field>
              <Field label="Pay frequency">
                <Select
                  value={draft.payFrequency}
                  onChange={(e) => setDraft((d) => ({ ...d, payFrequency: e.target.value }))}
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="BIWEEKLY">Bi-weekly</option>
                  <option value="WEEKLY">Weekly</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Field label="KRA PIN">
                <Input value={draft.kraPin} onChange={(e) => setDraft((d) => ({ ...d, kraPin: e.target.value }))} placeholder="A000..." />
              </Field>
              <Field label="NSSF No.">
                <Input value={draft.nssfNo} onChange={(e) => setDraft((d) => ({ ...d, nssfNo: e.target.value }))} />
              </Field>
              <Field label="SHIF No.">
                <Input value={draft.shifNo} onChange={(e) => setDraft((d) => ({ ...d, shifNo: e.target.value }))} />
              </Field>
            </div>

            <Button type="submit" variant="accent" disabled={isSaving}>
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add employee
            </Button>
          </form>
        </aside>
      </section>
    </div>
  );
}
