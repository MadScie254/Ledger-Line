import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { fetchDailyRates, SUPPORTED_CURRENCIES } from "@/lib/exchange-rates";

export const runtime = "nodejs";

/**
 * CRON endpoint: fetch today's exchange rates from Frankfurter and upsert into ExchangeRate.
 *
 * Invoke once per day via:
 *  - Cloudflare Cron Trigger (see wrangler.toml [triggers]) — set to run at 08:00 UTC
 *  - OR GitHub Actions schedule hitting GET /api/cron/exchange-rates with a secret header
 *
 * Protected by a CRON_SECRET env var so it can't be called anonymously.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return await withDatabase(async (prisma) => {
    // Find every distinct base currency used by any org
    const orgs = await prisma.organization.findMany({
      select: { id: true, baseCurrency: true },
    });

    const baseCurrencies = [...new Set(orgs.map((o) => o.baseCurrency).filter(Boolean))] as string[];

    if (baseCurrencies.length === 0) {
      return NextResponse.json({ message: "No orgs with a base currency found.", updated: 0 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalUpserted = 0;
    const errors: string[] = [];

    for (const base of baseCurrencies) {
      try {
        const targets = SUPPORTED_CURRENCIES.filter((c) => c !== base);
        const data = await fetchDailyRates(base, targets);

        // Find which orgs use this base currency
        const orgIds = orgs.filter((o) => o.baseCurrency === base).map((o) => o.id);

        for (const orgId of orgIds) {
          for (const [quoteCurrency, rate] of Object.entries(data.rates)) {
            await prisma.exchangeRate.upsert({
              where: {
                orgId_currencyCode_asOfDate: {
                  orgId,
                  currencyCode: quoteCurrency,
                  asOfDate: today,
                },
              },
              update: { rateToBase: rate },
              create: {
                orgId,
                currencyCode: quoteCurrency,
                rateToBase: rate,
                asOfDate: today,
              },
            });
            totalUpserted++;
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`base=${base}: ${msg}`);
        console.error("[cron/exchange-rates]", msg);
      }
    }

    return NextResponse.json({
      message: "Exchange rates refreshed.",
      date: today.toISOString().slice(0, 10),
      baseCurrencies,
      totalUpserted,
      errors: errors.length > 0 ? errors : undefined,
    });
  });
}
