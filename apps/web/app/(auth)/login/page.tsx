"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Button, Field, Input } from "@ledgerline/ui";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(searchParams.get("error"));
  const [isPending, startTransition] = useTransition();

  const errorId = "login-error";

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
    <div className="w-full max-w-sm space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Welcome back</p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-900">
          Sign in to your workspace
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-describedby={error ? errorId : undefined}>
        <Field label="Email address">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.co.ke"
            disabled={isPending}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className="w-full h-10 text-base"
          />
        </Field>

        <Field label="Password">
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="sr-only">Password</span>
              <Link
                href="/forgot-password"
                className="ml-auto text-xs font-medium text-brass-500 hover:text-brass-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isPending}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              className="w-full h-10 text-base"
            />
          </div>
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

        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="w-full h-10 text-base"
        >
          {isPending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-brass-500 hover:text-brass-600 transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-brass-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
