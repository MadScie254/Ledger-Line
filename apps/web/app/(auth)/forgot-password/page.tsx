"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/dashboard`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink-900 via-ink-800 to-slate-900 p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 sm:p-10 transition-all duration-300">
        
        <div className="flex justify-center items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-brass-500 to-brass-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-brass-400/50">
            LL
          </div>
          <span className="text-2xl font-semibold tracking-tight text-white">LedgerLine</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Reset password</h1>
          <p className="text-slate-300 text-sm">Enter your email to receive a reset link</p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-brass-400/20 border border-brass-400/50 text-brass-200 text-sm rounded-xl flex flex-col items-center gap-3 text-center">
              <span className="text-3xl">✉️</span>
              <p>Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.</p>
            </div>
            
            <Link 
              href="/login" 
              className="block text-center w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-brass-400 transition-all duration-200"
            >
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-200">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                disabled={isPending}
                className="w-full px-4 py-3 bg-ink-900/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brass-400 focus:border-transparent transition-all duration-200"
              />
            </div>

            {error && (
              <div className="p-3 bg-rust-700/20 border border-rust-700/50 text-red-200 text-sm rounded-lg flex items-start gap-2" role="alert">
                <span className="text-rust-400 mt-0.5">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full py-3 px-4 bg-gradient-to-r from-brass-500 to-brass-400 hover:from-brass-400 hover:to-brass-300 text-ink-900 font-semibold rounded-xl shadow-lg hover:shadow-brass-500/25 focus:outline-none focus:ring-2 focus:ring-brass-400 focus:ring-offset-2 focus:ring-offset-ink-900 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {isPending ? "Sending link…" : "Send reset link"}
            </button>
            
            <div className="text-center mt-6">
              <Link href="/login" className="text-sm font-medium text-brass-400 hover:text-brass-300 transition-colors">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
