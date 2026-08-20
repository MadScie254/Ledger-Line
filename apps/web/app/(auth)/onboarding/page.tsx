"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { AlertCircle, Building2, ChevronRight, LoaderCircle } from "lucide-react";
import { Button, Field, Input, Select } from "@ledgerline/ui";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

const INDUSTRIES = [
  "Retail & Trade",
  "Agriculture",
  "Manufacturing",
  "Construction",
  "Professional Services",
  "Technology",
  "Hospitality & Tourism",
  "Healthcare",
  "Transport & Logistics",
  "Education",
  "Financial Services",
  "Other",
];

const CURRENCIES = [
  { code: "KES", label: "KES — Kenyan Shilling" },
  { code: "UGX", label: "UGX — Ugandan Shilling" },
  { code: "TZS", label: "TZS — Tanzanian Shilling" },
  { code: "RWF", label: "RWF — Rwandan Franc" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "EUR", label: "EUR — Euro" },
];

const STEP_COPY = [
  { eyebrow: "Step 1 of 2", headline: "Tell us about your business" },
  { eyebrow: "Step 2 of 2", headline: "Tax & currency" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [orgName, setOrgName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [industry, setIndustry] = useState("");
  const [kraPin, setKraPin] = useState("");
  const [currency, setCurrency] = useState("KES");

  const errorId = "onboarding-error";

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, legalName, industry, kraPin, currency }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const supabase = createClient();
      await supabase.auth.refreshSession();
      router.push("/dashboard");
      router.refresh();
    });
  }

  const copy = STEP_COPY[step - 1]!;

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Step header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">{copy.eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-900">{copy.headline}</h2>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                s === step
                  ? "bg-brass-500 ring-4 ring-brass-500/20"
                  : s < step
                  ? "bg-brass-500"
                  : "bg-slate-300"
              }`}
            />
            {s === 1 && (
              <div className={`h-px w-10 transition-colors duration-300 ${step > 1 ? "bg-brass-500" : "bg-slate-300"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Business details */}
      {step === 1 && (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!orgName.trim()) return;
            setStep(2);
          }}
        >
          <Field label="Business name *">
            <Input
              id="orgName"
              type="text"
              required
              autoFocus
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Kenya Ltd"
              className="w-full h-10 text-base"
            />
          </Field>

          <Field label="Legal / registered name" hint="Leave blank if same as business name">
            <Input
              id="legalName"
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Acme Kenya Limited"
              className="w-full h-10 text-base"
            />
          </Field>

          <Field label="Industry">
            <Select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full h-10 text-base"
            >
              <option value="">— Select industry —</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </Select>
          </Field>

          <Button type="submit" variant="primary" className="w-full h-10 text-base mt-2">
            Continue
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
      )}

      {/* Step 2 — Tax & currency */}
      {step === 2 && (
        <form className="space-y-5" onSubmit={handleComplete} aria-describedby={error ? errorId : undefined}>
          <div className="rounded-[6px] border border-slate-200 bg-white p-4 space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
              <Building2 className="h-4 w-4 text-brass-500" aria-hidden="true" />
              {orgName}
            </div>
            {industry && <p className="text-xs text-slate-500 pl-6">{industry}</p>}
          </div>

          <Field label="KRA PIN" hint="e.g. P051234567X — used for VAT and PAYE calculations">
            <Input
              id="kraPin"
              type="text"
              value={kraPin}
              onChange={(e) => setKraPin(e.target.value.toUpperCase())}
              placeholder="P051234567X"
              maxLength={11}
              className="w-full h-10 text-base font-mono uppercase"
            />
          </Field>

          <Field label="Base currency">
            <Select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-10 text-base"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </Select>
          </Field>

          {error && (
            <div
              id={errorId}
              role="alert"
              className="flex items-start gap-2.5 rounded-[6px] border border-rust-700/30 bg-rust-700/8 px-3 py-2.5 text-sm text-rust-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(1)}
              disabled={isPending}
              className="w-1/3 h-10"
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              className="flex-1 h-10 text-base"
            >
              {isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating workspace…
                </>
              ) : (
                "Launch LedgerLine"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
