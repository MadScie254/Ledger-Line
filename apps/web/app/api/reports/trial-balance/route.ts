import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { calculateTrialBalance } from "@ledgerline/ledger-service";

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

      const entries = await prisma.journalEntry.findMany({
        where: { orgId: workspace.orgId },
        include: { lines: true }
      });

      // The types between DB model and ledger-service differ slightly 
      // because the DB has decimal strings and the service expects MoneyMinor
      const mappedEntries = entries.map(entry => ({
        ...entry,
        entryDate: entry.entryDate.toISOString(),
        postedAt: entry.postedAt.toISOString(),
        lines: entry.lines.map(line => ({
          ...line,
          debitMinor: Math.round(Number(line.debit) * 100),
          creditMinor: Math.round(Number(line.credit) * 100),
          description: line.description ?? undefined,
          entityType: (line.entityType as any) ?? undefined,
          entityId: line.entityId ?? undefined,
        }))
      }));

      const rows = calculateTrialBalance(accounts as any, mappedEntries as any)
        .filter(row => row.debitMinor > 0 || row.creditMinor > 0);

      let debitTotal = 0;
      let creditTotal = 0;
      for (const row of rows) {
        debitTotal += row.debitMinor;
        creditTotal += row.creditMinor;
      }

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
