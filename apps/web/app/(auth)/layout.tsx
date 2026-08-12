import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LedgerLine — Sign In",
  description: "Sign in or create your LedgerLine account.",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="auth-shell">
      {children}
    </div>
  );
}
