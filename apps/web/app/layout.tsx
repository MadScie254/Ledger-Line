import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ledgerline",
  description: "Enterprise accounting, bookkeeping, and business operations for East African companies."
};

import { Toaster } from "sonner";
import { ReactQueryProvider } from "@/components/react-query-provider";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
