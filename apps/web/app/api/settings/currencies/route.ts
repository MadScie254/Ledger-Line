import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const workspace = await requireWorkspace(request);
  if (isWorkspaceError(workspace)) return workspace;

  return await withDatabase(async (prisma) => {
    const org = await prisma.organization.findUnique({
      where: { id: workspace.orgId },
      select: { baseCurrency: true },
    });

    // Fetch latest exchange rates for this org (most recent date per currency)
    const allRates = await prisma.exchangeRate.findMany({
      where: { orgId: workspace.orgId },
      orderBy: { asOfDate: "desc" },
    });

    // Deduplicate: keep only the most recent rate per currency
    const seenCurrencies = new Set<string>();
    const latestRates = allRates.filter((r) => {
      if (seenCurrencies.has(r.currencyCode)) return false;
      seenCurrencies.add(r.currencyCode);
      return true;
    });

    const lastUpdated =
      latestRates.length > 0
        ? latestRates.reduce((latest, r) =>
            r.asOfDate > latest.asOfDate ? r : latest
          ).asOfDate.toISOString()
        : null;

    return NextResponse.json({
      baseCurrency: org?.baseCurrency ?? "KES",
      rates: latestRates.map((r) => ({
        id: r.id,
        currencyCode: r.currencyCode,
        rateToBase: r.rateToBase.toFixed(8),
        asOfDate: r.asOfDate.toISOString(),
      })),
      lastUpdated,
    });
  });
}
