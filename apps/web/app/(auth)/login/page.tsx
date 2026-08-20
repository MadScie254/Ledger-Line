"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Initialize error state from URL param if present
  const [error, setError] = useState<string | null>(searchParams.get("error"));
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
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
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back</h1>
          <p className="text-slate-300 text-sm">Sign in to your workspace</p>
        </div>

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

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-sm font-medium text-slate-200">Password</label>
              <Link href="/forgot-password" className="text-sm font-medium text-brass-400 hover:text-brass-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-300">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-brass-400 hover:text-brass-300 transition-colors">
            Create one for free
          </Link>
        </p>
      </div>
    </div>
  );
}
