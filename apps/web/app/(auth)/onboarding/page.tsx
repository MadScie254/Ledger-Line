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
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink-900 via-ink-800 to-slate-900 p-4 font-sans text-slate-100">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 sm:p-12 transition-all duration-300">
        <div className="flex justify-center items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-brass-500 to-brass-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-brass-400/50">
            LL
          </div>
          <span className="text-2xl font-semibold tracking-tight text-white">LedgerLine</span>
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    s === step
                      ? "bg-brass-400 ring-4 ring-brass-400/20"
                      : s < step
                      ? "bg-brass-500"
                      : "bg-white/20"
                  }`}
                />
                {s === 1 && (
                  <div
                    className={`h-0.5 w-12 transition-all duration-300 ${
                      s < step ? "bg-brass-500" : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Set up your workspace</h1>
              <p className="text-slate-300 text-sm">Tell us about your business</p>
            </div>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!orgName.trim()) return;
                setStep(2);
              }}
            >
              <div className="space-y-1.5">
                <label htmlFor="orgName" className="block text-sm font-medium text-slate-200">Business name *</label>
                <input
                  id="orgName"
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Kenya Ltd"
                  autoFocus
                  className="w-full px-4 py-3 bg-ink-900/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brass-400 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="legalName" className="block text-sm font-medium text-slate-200">
                  Legal / registered name{" "}
                  <span className="text-slate-400 font-normal text-xs">(if different)</span>
                </label>
                <input
                  id="legalName"
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Acme Kenya Limited"
                  className="w-full px-4 py-3 bg-ink-900/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brass-400 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="industry" className="block text-sm font-medium text-slate-200">Industry</label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 bg-ink-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brass-400 focus:border-transparent transition-all duration-200 appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23c8ced7\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em 1.2em' }}
                >
                  <option value="" className="bg-ink-800 text-slate-300">— Select industry —</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i} className="bg-ink-800 text-white">
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full mt-8 py-3 px-4 bg-gradient-to-r from-brass-500 to-brass-400 hover:from-brass-400 hover:to-brass-300 text-ink-900 font-semibold rounded-xl shadow-lg hover:shadow-brass-500/25 focus:outline-none focus:ring-2 focus:ring-brass-400 focus:ring-offset-2 focus:ring-offset-ink-900 transition-all duration-200 transform active:scale-[0.98]"
              >
                Continue →
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Tax &amp; currency</h1>
              <p className="text-slate-300 text-sm">Used for VAT, PAYE, and all financial reports</p>
            </div>

            <form className="space-y-5" onSubmit={handleComplete}>
              <div className="space-y-1.5">
                <label htmlFor="kraPin" className="block text-sm font-medium text-slate-200">KRA PIN</label>
                <input
                  id="kraPin"
                  type="text"
                  value={kraPin}
                  onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                  placeholder="P051234567X"
                  maxLength={11}
                  className="w-full px-4 py-3 bg-ink-900/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brass-400 focus:border-transparent transition-all duration-200 uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="currency" className="block text-sm font-medium text-slate-200">Base currency</label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-ink-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brass-400 focus:border-transparent transition-all duration-200 appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23c8ced7\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em 1.2em' }}
                >
                  <option value="KES" className="bg-ink-800 text-white">KES — Kenyan Shilling</option>
                  <option value="UGX" className="bg-ink-800 text-white">UGX — Ugandan Shilling</option>
                  <option value="TZS" className="bg-ink-800 text-white">TZS — Tanzanian Shilling</option>
                  <option value="RWF" className="bg-ink-800 text-white">RWF — Rwandan Franc</option>
                  <option value="USD" className="bg-ink-800 text-white">USD — US Dollar</option>
                  <option value="GBP" className="bg-ink-800 text-white">GBP — British Pound</option>
                  <option value="EUR" className="bg-ink-800 text-white">EUR — Euro</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-rust-700/20 border border-rust-700/50 text-red-200 text-sm rounded-lg flex items-start gap-2" role="alert">
                  <span className="text-rust-400 mt-0.5">⚠️</span>
                  {error}
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isPending}
                  className="w-1/3 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-2/3 py-3 px-4 bg-gradient-to-r from-brass-500 to-brass-400 hover:from-brass-400 hover:to-brass-300 text-ink-900 font-semibold rounded-xl shadow-lg hover:shadow-brass-500/25 focus:outline-none focus:ring-2 focus:ring-brass-400 focus:ring-offset-2 focus:ring-offset-ink-900 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                  {isPending ? "Creating workspace…" : "Launch LedgerLine"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
