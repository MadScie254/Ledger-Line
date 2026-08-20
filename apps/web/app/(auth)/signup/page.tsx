"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Button, Field, Input } from "@ledgerline/ui";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

/** 4-segment password strength bar */
function PasswordStrengthBar({ password }: { password: string }) {
  function getStrength(p: string): number {
    if (p.length === 0) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(4, score);
  }

  const strength = getStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const segmentColors = [
    "", // 0 — unused
    "bg-rust-700", // 1 — weak
    "bg-rust-700", // 2 — fair (still orange-red)
    "bg-brass-400", // 3 — good
    "bg-ledger-green-700", // 4 — strong
  ];

  if (password.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              level <= strength ? segmentColors[strength] : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p
          className={`text-xs font-medium ${
            strength <= 2 ? "text-rust-700" : strength === 3 ? "text-brass-500" : "text-ledger-green-700"
          }`}
        >
          {labels[strength]}
        </p>
      )}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const errorId = "signup-error";

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
    <div className="w-full max-w-sm space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-500">Get started</p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-900">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-slate-500">14-day free trial · No credit card required</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
        aria-describedby={error ? errorId : undefined}
      >
        <Field label="Full name">
          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Njoroge"
            disabled={isPending}
            className="w-full h-10 text-base"
          />
        </Field>

        <Field label="Work email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.co.ke"
            disabled={isPending}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className="w-full h-10 text-base"
          />
        </Field>

        <div>
          <Field label="Password">
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              disabled={isPending}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              className="w-full h-10 text-base"
            />
          </Field>
          <PasswordStrengthBar password={password} />
        </div>

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
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brass-500 hover:text-brass-600 transition-colors">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-slate-400">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline hover:text-slate-500 transition-colors">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline hover:text-slate-500 transition-colors">Privacy Policy</Link>.
      </p>
    </div>
  );
}
