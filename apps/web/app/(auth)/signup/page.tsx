"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LedgerlineLogo } from "@ledgerline/ui";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink-900 via-ink-800 to-slate-900 p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 sm:p-10 transition-all duration-300">
        
        <LedgerlineLogo className="mb-8" size="lg" />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create your account</h1>
          <p className="text-slate-300 text-sm">Start your 14-day free trial — no credit card required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-slate-200">Full name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Njoroge"
              disabled={isPending}
              className="w-full px-4 py-3 bg-ink-900/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brass-400 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-slate-200">Work email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.co.ke"
              disabled={isPending}
              className="w-full px-4 py-3 bg-ink-900/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brass-400 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-slate-200">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
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
            {isPending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-300">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brass-400 hover:text-brass-300 transition-colors">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-slate-400">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline hover:text-slate-300 transition-colors">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-slate-300 transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
