import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify your email — LedgerLine",
};

export default function VerifyEmailPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">LL</span>
          <span className="auth-logo-text">LedgerLine</span>
        </div>

        <div className="auth-icon-wrap">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
            <rect width="48" height="48" rx="12" fill="#10b981" fillOpacity=".12" />
            <path d="M14 20l10 7 10-7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="11" y="16" width="26" height="18" rx="2" stroke="#10b981" strokeWidth="2" />
          </svg>
        </div>

        <h1 className="auth-heading">Check your email</h1>
        <p className="auth-subheading">
          We&apos;ve sent a verification link. Click it to confirm your address
          and finish setting up your account.
        </p>

        <p className="auth-hint">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <Link href="/signup" className="auth-link">
            try a different email address
          </Link>
          .
        </p>

        <Link href="/login" className="auth-btn-secondary">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
