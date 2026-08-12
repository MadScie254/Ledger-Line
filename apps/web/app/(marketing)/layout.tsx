import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LedgerLine — Double-Entry Accounting for East African SMEs",
  description:
    "LedgerLine gives East African businesses bank-grade double-entry accounting, invoicing, payroll, and real-time reporting — all in one beautiful, fast platform.",
};

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
