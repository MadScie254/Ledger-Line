import Link from "next/link";
import type { Metadata } from "next";
import { LedgerlineLogo } from "@ledgerline/ui";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Verify your email — LedgerLine",
  description: "Check your inbox to verify your email address and finish setting up your LedgerLine account.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { email } = await searchParams;
  const displayEmail = typeof email === "string" ? email : null;

  return (
    <div className="w-full max-w-sm space-y-8 text-center">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ledger-green-700/20 bg-ledger-green-700/10">
          <Mail className="h-8 w-8 text-ledger-green-700" aria-hidden="true" />
        </div>
      </div>

      {/* Copy */}
      <div className="space-y-3">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-ink-900">
          Check your inbox
        </h2>
        {displayEmail ? (
          <p className="text-sm leading-relaxed text-slate-500">
            We&apos;ve sent a verification link to{" "}
            <strong className="font-semibold text-ink-900">{displayEmail}</strong>.
            Click it to confirm your address and finish setting up your account.
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-slate-500">
            We&apos;ve sent a verification link to your email address. Click it to
            confirm your address and finish setting up your account.
          </p>
        )}
      </div>

      {/* Hint box */}
      <div className="rounded-[6px] border border-slate-200 bg-white px-4 py-3 text-left">
        <p className="text-sm text-slate-500">
          Didn&apos;t receive it? Check your spam folder, or{" "}
          <Link
            href="/signup"
            className="font-medium text-brass-500 hover:text-brass-600 transition-colors underline"
          >
            try a different email address
          </Link>
          .
        </p>
      </div>

      {/* Back link */}
      <Link
        href="/login"
        className="inline-flex w-full items-center justify-center rounded-[6px] border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-sm transition hover:bg-paper-50"
      >
        Back to sign in
      </Link>
    </div>
  );
}
