"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { Button, Field, Input } from "@ledgerline/ui";

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

  const errorId = "forgot-error";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ledger-green-700/20 bg-ledger-green-700/10">
            <CheckCircle2 className="h-8 w-8 text-ledger-green-700" aria-hidden="true" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-ink-900">Check your email</h2>
          <p className="text-sm text-slate-500">
            We&apos;ve sent a password reset link to <strong className="font-semibold text-ink-900">{email}</strong>.
            If it doesn&apos;t appear within a few minutes, check your spam folder.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-[6px] border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-sm transition hover:bg-paper-50"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Account recovery</p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-900">Reset your password</h2>
        <p className="mt-2 text-sm text-slate-500">Enter your email to receive a reset link.</p>
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
              Sending link…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-brass-500 hover:text-brass-600 transition-colors">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
