import Link from "next/link";
import type { Metadata } from "next";
import { LedgerlineLogo } from "@ledgerline/ui";

export const metadata: Metadata = {
  title: "Verify your email — LedgerLine",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { email } = await searchParams;
  const displayEmail = typeof email === "string" ? email : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink-900 via-ink-800 to-slate-900 p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 sm:p-10 transition-all duration-300 text-center flex flex-col items-center">
        
        <LedgerlineLogo className="mb-8" size="lg" />

        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-inner">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Check your email</h1>
        
        {displayEmail ? (
          <p className="text-slate-300 text-base mb-6 leading-relaxed">
            We've sent a verification link to <strong className="text-white font-semibold">{displayEmail}</strong>. Click it to confirm your address and finish setting up your account.
          </p>
        ) : (
          <p className="text-slate-300 text-base mb-6 leading-relaxed">
            We've sent a verification link. Click it to confirm your address and finish setting up your account.
          </p>
        )}

        <div className="w-full p-4 bg-ink-900/40 border border-white/5 rounded-xl mb-8">
          <p className="text-sm text-slate-400">
            Didn't receive it? Check your spam folder or{" "}
            <Link href="/signup" className="text-brass-400 hover:text-brass-300 transition-colors underline">
              try a different email address
            </Link>.
          </p>
        </div>

        <Link 
          href="/login" 
          className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-brass-400 transition-all duration-200"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
