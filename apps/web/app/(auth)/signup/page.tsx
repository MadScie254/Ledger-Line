"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">LL</span>
          <span className="auth-logo-text">LedgerLine</span>
        </div>

        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subheading">
          Start your 14-day free trial — no credit card required
        </p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Njoroge"
              disabled={isPending}
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.co.ke"
              disabled={isPending}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
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
            />
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="auth-btn-primary" disabled={isPending}>
            {isPending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link href="/login" className="auth-link">
            Sign in
          </Link>
        </p>

        <p className="auth-legal">
          By creating an account you agree to our{" "}
          <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
