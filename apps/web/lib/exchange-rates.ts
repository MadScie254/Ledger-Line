/**
 * Frankfurter.dev — free, open-source FX rates from the European Central Bank.
 * No API key, no rate limit. Covers KES, USD, EUR, GBP, INR, ZAR, etc.
 * Cache results in the ExchangeRate table — do NOT call this more than once per day per currency.
 */

export interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

/**
 * Fetch the latest exchange rates from Frankfurter.
 * @param base  ISO 4217 base currency code (e.g. "KES", "USD")
 * @param targets Array of target currency codes (e.g. ["USD", "EUR", "GBP"])
 */
export async function fetchDailyRates(
  base: string,
  targets: string[]
): Promise<FrankfurterResponse> {
  const symbols = targets.filter((t) => t !== base).join(",");
  const url = symbols
    ? `https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${symbols}`
    : `https://api.frankfurter.dev/v1/latest?base=${base}`;

  const res = await fetch(url, {
    // Next.js cache: revalidate once per day
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(
      `Frankfurter fetch failed: ${res.status} ${res.statusText} (base=${base}, symbols=${symbols})`
    );
  }

  return res.json() as Promise<FrankfurterResponse>;
}

/** All currencies currently onboarded in the UI */
export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "KES",
  "INR",
  "ZAR",
  "NGN",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
