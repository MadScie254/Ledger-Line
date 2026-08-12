import { NextRequest, NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { calculateAccountBalances, minorToDecimal } from "@ledgerline/ledger-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    return await withDatabase(async (prisma) => {
      // 1. Get total unpaid invoices
      const unpaidInvoicesAgg = await prisma.invoice.aggregate({
        where: { orgId: workspace.orgId, status: { notIn: ["PAID", "VOID"] } },
        _sum: { balanceDue: true }
      });
      const unpaidInvoices = unpaidInvoicesAgg._sum.balanceDue?.toNumber() ?? 0;

      // 2. Get total unpaid bills
      const unpaidBillsAgg = await prisma.bill.aggregate({
        where: { orgId: workspace.orgId, status: { notIn: ["PAID"] } },
        _sum: { total: true, amountPaid: true }
      });
      const unpaidBills = (unpaidBillsAgg._sum.total?.toNumber() ?? 0) - (unpaidBillsAgg._sum.amountPaid?.toNumber() ?? 0);

      // 3. Get cash balance
      const cashAccounts = await prisma.account.findMany({
        where: { orgId: workspace.orgId, type: "ASSET", code: { startsWith: "10" } }, // Assuming 10xx is cash/bank
        select: { id: true }
      });
      
      const cashAccountIds = cashAccounts.map(a => a.id);
      
      let cashBalance = 0;
      if (cashAccountIds.length > 0) {
        const cashLines = await prisma.journalLine.aggregate({
          where: { accountId: { in: cashAccountIds } },
          _sum: { debit: true, credit: true }
        });
        cashBalance = (cashLines._sum.debit?.toNumber() ?? 0) - (cashLines._sum.credit?.toNumber() ?? 0);
      }

      // 4. Get recent activity
      const recentActivity = await prisma.journalEntry.findMany({
        where: { orgId: workspace.orgId },
        orderBy: { entryDate: "desc" },
        take: 5,
        include: { lines: { include: { account: true } } }
      });

      return NextResponse.json({
        kpis: {
          unpaidInvoices,
          unpaidBills,
          cashBalance
        },
        recentActivity: recentActivity.map(entry => ({
          id: entry.id,
          date: entry.entryDate,
          memo: entry.memo,
          amount: entry.lines.reduce((sum, line) => sum + line.debit.toNumber(), 0)
        }))
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch dashboard data." }, { status: 500 });
  }
}
