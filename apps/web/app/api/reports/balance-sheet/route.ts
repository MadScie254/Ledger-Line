import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const report = await withDatabase(async (prisma) => {
      const accounts = await prisma.account.findMany({
        where: { orgId: workspace.orgId },
        orderBy: { code: 'asc' }
      });

      const lines = await prisma.journalLine.findMany({
        where: {
          journalEntry: {
            orgId: workspace.orgId,
          }
        },
      });

      const balances = new Map<string, number>();

      for (const line of lines) {
        const debitMinor = Math.round(Number(line.debit) * 100);
        const creditMinor = Math.round(Number(line.credit) * 100);
        balances.set(line.accountId, (balances.get(line.accountId) ?? 0) + debitMinor - creditMinor);
      }

      let assetsTotal = 0;
      let liabilitiesTotal = 0;
      let equityTotal = 0;
      let netIncome = 0;

      const assets: any[] = [];
      const liabilities: any[] = [];
      const equity: any[] = [];

      for (const account of accounts) {
        const rawBalance = balances.get(account.id) ?? 0;
        if (rawBalance === 0) continue;

        if (account.type === "ASSET") {
          const balance = rawBalance; // Debit normal
          assetsTotal += balance;
          assets.push({ account, balanceMinor: balance });
        } else if (account.type === "LIABILITY") {
          const balance = -rawBalance; // Credit normal
          liabilitiesTotal += balance;
          liabilities.push({ account, balanceMinor: balance });
        } else if (account.type === "EQUITY") {
          const balance = -rawBalance; // Credit normal
          equityTotal += balance;
          equity.push({ account, balanceMinor: balance });
        } else if (account.type === "INCOME") {
          netIncome += -rawBalance; // Credit normal
        } else if (account.type === "COGS" || account.type === "EXPENSE") {
          netIncome -= rawBalance; // Debit normal
        }
      }

      // Add Net Income to Equity
      if (netIncome !== 0) {
        equityTotal += netIncome;
        equity.push({
          account: { id: "net-income", code: "", name: "Net Income", type: "EQUITY" },
          balanceMinor: netIncome
        });
      }

      const isBalanced = assetsTotal === (liabilitiesTotal + equityTotal);

      return {
        assets,
        liabilities,
        equity,
        assetsTotal,
        liabilitiesTotal,
        equityTotal,
        liabilitiesAndEquityTotal: liabilitiesTotal + equityTotal,
        isBalanced
      };
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to build balance sheet." }, { status: 400 });
  }
}
