import { cn } from "../utils/cn";

interface CurrencyAmountProps {
  amountMinor: number;
  currency?: string;
  tone?: "neutral" | "income" | "expense" | "muted";
  showSign?: boolean;
  className?: string;
}

export function CurrencyAmount({
  amountMinor,
  currency = "KES",
  tone = "neutral",
  showSign = false,
  className
}: CurrencyAmountProps) {
  const formatted = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    signDisplay: showSign ? "exceptZero" : "auto",
    maximumFractionDigits: 2
  }).format(amountMinor / 100);

  return (
    <span
      className={cn(
        "font-mono tabular-nums tracking-normal",
        tone === "income" && "text-ledger-green-700",
        tone === "expense" && "text-rust-700",
        tone === "muted" && "text-slate-500",
        className
      )}
    >
      {formatted}
    </span>
  );
}
