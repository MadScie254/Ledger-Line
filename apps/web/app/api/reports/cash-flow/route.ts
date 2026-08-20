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

      let netIncome = 0;
      let cashBalance = 0;

      for (const account of accounts) {
        const rawBalance = balances.get(account.id) ?? 0;
        
        if (account.type === "INCOME") {
          netIncome += -rawBalance;
        } else if (account.type === "COGS" || account.type === "EXPENSE") {
          netIncome -= rawBalance;
        }

        // Assuming cash accounts are Assets with code '1000' or '1200' or named 'Cash'/'Bank'
        if (account.type === "ASSET" && (account.name.toLowerCase().includes("cash") || account.name.toLowerCase().includes("bank") || account.code === "1000")) {
          cashBalance += rawBalance;
        }
      }

      // Very simplified cash flow
      return {
        operatingActivities: {
          netIncome,
          adjustments: 0,
          netOperatingCash: netIncome
        },
        investingActivities: {
          netInvestingCash: 0
        },
        financingActivities: {
          netFinancingCash: 0
        },
        netIncreaseInCash: netIncome,
        endingCashBalance: cashBalance
      };
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to build cash flow." }, { status: 400 });
  }
}
