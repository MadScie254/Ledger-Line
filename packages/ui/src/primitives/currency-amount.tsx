import { cn } from "../utils/cn";

interface CurrencyAmountProps {
  amountMinor: number;
  currency?: string;
  tone?: "neutral" | "income" | "expense" | "muted";
  showSign?: boolean;
  display?: "inline" | "stacked";
  className?: string;
}

export function CurrencyAmount({
  amountMinor,
  currency = "KES",
  tone = "neutral",
  showSign = false,
  display = "inline",
  className
}: CurrencyAmountProps) {
  const formatter = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    signDisplay: showSign ? "exceptZero" : "auto",
    maximumFractionDigits: 2
  });
  const formatted = formatter.format(amountMinor / 100);
  const parts = formatter.formatToParts(amountMinor / 100);
  const currencyLabel = parts.find((part) => part.type === "currency")?.value ?? currency;
  const numericValue = parts
    .filter((part) => part.type !== "currency" && part.type !== "literal")
    .map((part) => part.value)
    .join("");

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
      {display === "stacked" ? (
        <span className="inline-flex flex-wrap items-baseline gap-x-2">
          <span className="text-[0.58em] font-semibold uppercase tracking-[0.08em] text-slate-500">{currencyLabel}</span>
          <span>{numericValue}</span>
        </span>
      ) : (
        formatted
      )}
    </span>
  );
}
