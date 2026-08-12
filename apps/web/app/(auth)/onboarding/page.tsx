"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

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

      // Reload to pick up the updated session metadata (orgId)
      const supabase = createClient();
      await supabase.auth.refreshSession();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="auth-page">
      <div className="auth-card onboarding-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">LL</span>
          <span className="auth-logo-text">LedgerLine</span>
        </div>

        <div className="onboarding-steps">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`onboarding-step-dot ${s <= step ? "active" : ""}`}
            />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="auth-heading">Set up your workspace</h1>
            <p className="auth-subheading">Tell us about your business</p>

            <form
              className="auth-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!orgName.trim()) return;
                setStep(2);
              }}
            >
              <div className="form-field">
                <label htmlFor="orgName">Business name *</label>
                <input
                  id="orgName"
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Kenya Ltd"
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="legalName">
                  Legal / registered name{" "}
                  <span className="form-hint">(if different)</span>
                </label>
                <input
                  id="legalName"
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Acme Kenya Limited"
                />
              </div>

              <div className="form-field">
                <label htmlFor="industry">Industry</label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="">— Select industry —</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="auth-btn-primary">
                Continue →
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="auth-heading">Tax &amp; currency</h1>
            <p className="auth-subheading">
              Used for VAT, PAYE, and all financial reports
            </p>

            <form className="auth-form" onSubmit={handleComplete}>
              <div className="form-field">
                <label htmlFor="kraPin">KRA PIN</label>
                <input
                  id="kraPin"
                  type="text"
                  value={kraPin}
                  onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                  placeholder="P051234567X"
                  maxLength={11}
                />
              </div>

              <div className="form-field">
                <label htmlFor="currency">Base currency</label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="KES">KES — Kenyan Shilling</option>
                  <option value="UGX">UGX — Ugandan Shilling</option>
                  <option value="TZS">TZS — Tanzanian Shilling</option>
                  <option value="RWF">RWF — Rwandan Franc</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}

              <div className="form-row">
                <button
                  type="button"
                  className="auth-btn-secondary"
                  onClick={() => setStep(1)}
                  disabled={isPending}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={isPending}
                >
                  {isPending ? "Creating workspace…" : "Launch LedgerLine"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
