import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ledgerline",
  description: "Enterprise accounting, bookkeeping, and business operations for East African companies."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
