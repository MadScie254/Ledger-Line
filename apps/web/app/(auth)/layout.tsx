import type { Metadata } from "next";
import { LedgerlineLogo } from "@ledgerline/ui";

export const metadata: Metadata = {
  title: "LedgerLine — Sign In",
  description: "Sign in or create your LedgerLine account.",
};

/** Left-panel decorative SVG — balanced ledger scale motif in brass-500 line art */
function LedgerIllustration() {
  return (
    <svg
      viewBox="0 0 260 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[260px] opacity-30"
      aria-hidden="true"
    >
      {/* Fulcrum post */}
      <rect x="127" y="100" width="6" height="90" rx="3" fill="#b8863b" />
      <rect x="110" y="182" width="40" height="6" rx="3" fill="#b8863b" />
      {/* Beam */}
      <rect x="40" y="98" width="180" height="5" rx="2.5" fill="#b8863b" />
      {/* Left pan */}
      <ellipse cx="75" cy="145" rx="34" ry="8" stroke="#b8863b" strokeWidth="2" />
      <line x1="75" y1="103" x2="75" y2="137" stroke="#b8863b" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="42" y1="137" x2="108" y2="137" stroke="#b8863b" strokeWidth="2" />
      {/* Right pan */}
      <ellipse cx="185" cy="130" rx="34" ry="8" stroke="#b8863b" strokeWidth="2" />
      <line x1="185" y1="103" x2="185" y2="122" stroke="#b8863b" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="152" y1="122" x2="218" y2="122" stroke="#b8863b" strokeWidth="2" />
      {/* Ledger lines top */}
      <rect x="30" y="24" width="200" height="1.5" rx="1" fill="#b8863b" opacity="0.5" />
      <rect x="30" y="40" width="140" height="1.5" rx="1" fill="#b8863b" opacity="0.3" />
      <rect x="30" y="56" width="170" height="1.5" rx="1" fill="#b8863b" opacity="0.3" />
      <rect x="30" y="72" width="120" height="1.5" rx="1" fill="#b8863b" opacity="0.3" />
      {/* Column separator */}
      <rect x="175" y="24" width="1" height="52" rx="0.5" fill="#b8863b" opacity="0.4" />
      {/* Debit/credit amounts */}
      <rect x="180" y="36" width="44" height="1.5" rx="1" fill="#b8863b" opacity="0.5" />
      <rect x="180" y="52" width="44" height="1.5" rx="1" fill="#b8863b" opacity="0.4" />
      <rect x="180" y="68" width="44" height="1.5" rx="1" fill="#b8863b" opacity="0.4" />
    </svg>
  );
}

const VALUE_PROPS = [
  { headline: "Post once, trust every report.", detail: "Balanced debits and credits on every transaction." },
  { headline: "Built for KES, VAT, and eTIMS.", detail: "Kenya-native accounting — KRA PIN, NSSF, SHIF included." },
  { headline: "Your whole team, under one roof.", detail: "Role-based access from bookkeeper to CFO." },
];

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[3fr_2fr]">
      {/* ── Left panel — ink-900 brand panel ─────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-ink-900 px-14 py-12 text-white">
        {/* Top: wordmark */}
        <div>
          <LedgerlineLogo size="lg" className="text-white [&_*]:fill-white" />
        </div>

        {/* Middle: headline + illustration */}
        <div className="space-y-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-400 mb-3">
              Accounting for East Africa
            </p>
            <h1 className="font-serif text-4xl font-bold leading-[1.15] tracking-tight">
              The last accounting tool<br />
              your business will need.
            </h1>
          </div>

          <LedgerIllustration />

          {/* Value props */}
          <ul className="space-y-5">
            {VALUE_PROPS.map((v) => (
              <li key={v.headline} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brass-500/40 bg-brass-500/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass-400" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{v.headline}</p>
                  <p className="text-xs leading-5 text-slate-400">{v.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: trust line */}
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} LedgerLine Technologies Ltd. · Nairobi, Kenya
        </p>
      </div>

      {/* ── Right panel — paper-50 form area ─────────────────────────── */}
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper-50 px-6 py-12 lg:px-12">
        {/* Mobile-only logo */}
        <div className="mb-8 lg:hidden">
          <LedgerlineLogo size="md" />
        </div>
        {children}
      </div>
    </div>
  );
}
