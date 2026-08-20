/**
 * Format a monetary amount using the org's base currency.
 *
 * @param amount - The amount in major units (e.g., 1234.56)
 * @param currency - ISO 4217 currency code (e.g., "KES", "USD")
 * @param maximumFractionDigits - Decimal places (default 2)
 */
export function formatMoney(
  amount: number,
  currency: string,
  maximumFractionDigits = 2
): string {
  // Map currency codes to their preferred locales
  const localeMap: Record<string, string> = {
    KES: "en-KE",
    UGX: "en-UG",
    TZS: "en-TZ",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    ZAR: "en-ZA",
    NGN: "en-NG",
    GHS: "en-GH",
    ETB: "am-ET",
  };

  const locale = localeMap[currency] ?? "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Format minor-unit amounts (e.g., cents/fils) to currency string.
 *
 * @param amountMinor - Amount in minor units (e.g., 123456 for KES 1,234.56)
 * @param currency - ISO 4217 currency code
 */
export function formatMoneyMinor(
  amountMinor: number,
  currency: string,
  maximumFractionDigits = 0
): string {
  // Cents-based currencies: divide by 100
  // No-decimal currencies like UGX, TZS: keep as-is
  const noDecimalCurrencies = ["UGX", "TZS", "JPY", "KRW", "VND"];
  const divisor = noDecimalCurrencies.includes(currency) ? 1 : 100;
  return formatMoney(amountMinor / divisor, currency, maximumFractionDigits);
}
