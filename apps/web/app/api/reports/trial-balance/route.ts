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

      let debitTotal = 0;
      let creditTotal = 0;

      const rows = accounts.map((account) => {
        const rawBalance = balances.get(account.id) ?? 0;
        const debitMinor = rawBalance > 0 ? rawBalance : 0;
        const creditMinor = rawBalance < 0 ? Math.abs(rawBalance) : 0;

        debitTotal += debitMinor;
        creditTotal += creditMinor;

        return {
          account,
          debitMinor,
          creditMinor,
          balanceMinor: rawBalance
        };
      }).filter(row => row.debitMinor > 0 || row.creditMinor > 0);

      return {
        rows,
        debitTotal,
        creditTotal,
        isBalanced: debitTotal === creditTotal
      };
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to build trial balance." }, { status: 400 });
  }
}
