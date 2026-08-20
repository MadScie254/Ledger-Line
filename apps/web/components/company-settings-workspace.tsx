"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button, DoubleRule, Field, Input, Select } from "@ledgerline/ui";
import { Check, LoaderCircle, Building2 } from "lucide-react";
import { toast } from "sonner";

interface CompanyProfile {
  id: string;
  name: string;
  legalName: string | null;
  kraPin: string | null;
  industry: string | null;
  fiscalYearStartMonth: number;
  baseCurrency: string;
  planTier: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CURRENCIES = ["KES", "USD", "EUR", "UGX", "TZS"];

export function CompanySettingsWorkspace() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<CompanyProfile>({
    queryKey: ["company-settings"],
    queryFn: () => fetch("/api/settings/company").then((res) => res.json()),
  });

  const [draft, setDraft] = useState<Partial<CompanyProfile>>({});

  useEffect(() => {
    if (data) {
      setDraft({
        name: data.name,
        legalName: data.legalName ?? "",
        kraPin: data.kraPin ?? "",
        industry: data.industry ?? "",
        fiscalYearStartMonth: data.fiscalYearStartMonth,
        baseCurrency: data.baseCurrency,
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<CompanyProfile>) => {
      const res = await fetch("/api/settings/company", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error ?? "Failed to save company settings.");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Company profile saved");
      void queryClient.invalidateQueries({ queryKey: ["company-settings"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-slate-500">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        Loading company profile...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-rust-700">
        <p className="font-semibold">Failed to load company profile</p>
        <p className="text-sm">{(error as Error)?.message || "Unknown error"}</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate(draft);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Settings</p>
          <span className="inline-flex items-center rounded-full bg-ledger-green-50 px-2 py-0.5 text-xs font-semibold text-ledger-green-700 border border-ledger-green-200">
            {data.planTier}
          </span>
        </div>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-normal text-ink-900">Company profile</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Your organization&apos;s legal details, tax identifiers, and accounting preferences.
        </p>
        <DoubleRule className="mt-5" />
      </header>

      <div className="rounded-[10px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-ink-900 text-brass-400">
            <Building2 className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-ink-900">Organization details</h2>
        </div>

        <form className="px-5 py-5 grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Trading name">
              <Input
                value={draft.name ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                required
              />
            </Field>
            <Field label="Legal / registered name">
              <Input
                value={draft.legalName ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, legalName: e.target.value }))}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="KRA PIN" hint="Required for eTIMS and VAT returns">
              <Input
                value={draft.kraPin ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, kraPin: e.target.value }))}
                placeholder="e.g. P052618349Z"
              />
            </Field>
            <Field label="Industry">
              <Input
                value={draft.industry ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, industry: e.target.value }))}
                placeholder="e.g. Wholesale distribution"
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Base currency">
              <Select
                value={draft.baseCurrency ?? "KES"}
                onChange={(e) => setDraft((d) => ({ ...d, baseCurrency: e.target.value }))}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Fiscal year start" hint="The month your financial year begins">
              <Select
                value={draft.fiscalYearStartMonth ?? 1}
                onChange={(e) => setDraft((d) => ({ ...d, fiscalYearStartMonth: Number(e.target.value) }))}
              >
                {MONTHS.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <Button type="submit" variant="accent" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? <LoaderCircle className="h-4 w-4 animate-spin" />
                : <Check className="h-4 w-4" />
              }
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
