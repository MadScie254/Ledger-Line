import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { withDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;
    const { orgId, baseCurrency } = workspace;

    const data = await withDatabase(async (prisma) => {
      const now = new Date();
      // Build a 6-month window [startDate, now]
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 5);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      // ── Revenue & Expenses per month via JournalLine ──────────────────────
      // Revenue: credit lines in INCOME accounts
      // Expenses: debit lines in EXPENSE/COGS accounts
      const journalLines = await prisma.journalLine.findMany({
        where: {
          journalEntry: {
            orgId,
            entryDate: { gte: startDate, lte: now },
          },
          account: {
            type: { in: ["INCOME", "EXPENSE", "COGS"] },
          },
        },
        select: {
          credit: true,
          debit: true,
          account: { select: { type: true } },
          journalEntry: { select: { entryDate: true } },
        },
      });

      // Group into months
      const monthlyMap: Record<string, { revenue: number; expenses: number }> = {};
      for (let i = 0; i < 6; i++) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - (5 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap[key] = { revenue: 0, expenses: 0 };
      }

      for (const line of journalLines) {
        const d = new Date(line.journalEntry.entryDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyMap[key]) continue;
        const credit = Number(line.credit) || 0;
        const debit = Number(line.debit) || 0;
        if (line.account.type === "INCOME") {
          monthlyMap[key].revenue += credit;
        } else if (line.account.type === "EXPENSE" || line.account.type === "COGS") {
          monthlyMap[key].expenses += debit;
        }
      }

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const trend = Object.entries(monthlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, vals]) => {
          const month = parseInt(key.split("-")[1]!) - 1;
          // Values are in major units already since Decimal(18,2). Round to whole numbers for chart readability.
          return {
            month: monthNames[month],
            revenue: Math.round(vals.revenue),
            expenses: Math.round(vals.expenses),
          };
        });

      const totalRevenue = trend.reduce((s, t) => s + t.revenue, 0);
      const totalExpenses = trend.reduce((s, t) => s + t.expenses, 0);

      // ── Top expense categories ──────────────────────────────────────────────
      const expenseLines = await prisma.journalLine.groupBy({
        by: ["accountId"],
        where: {
          journalEntry: {
            orgId,
            entryDate: { gte: startDate, lte: now }
          },
          debit: { gt: 0 },
          account: { type: { in: ["EXPENSE", "COGS"] } },
        },
        _sum: { debit: true },
        orderBy: { _sum: { debit: "desc" } },
        take: 6,
      });

      // Look up account names
      const accountIds = expenseLines.map((e) => e.accountId);
      const accounts = await prisma.account.findMany({
        where: { id: { in: accountIds }, orgId },
        select: { id: true, name: true },
      });
      const accountNameMap = Object.fromEntries(accounts.map((a) => [a.id, a.name]));

      const expenseCategories = expenseLines.map((e) => ({
        name: accountNameMap[e.accountId] ?? "Other",
        value: Math.round(Number(e._sum.debit ?? 0)),
      }));

      // ── Invoice status summary ────────────────────────────────────────────
      const invoiceSummary = await prisma.invoice.groupBy({
        by: ["status"],
        where: { orgId },
        _count: { _all: true },
        _sum: { total: true },
      });

      const invoiceStatusMap: Record<string, { count: number; total: number }> = {};
      for (const row of invoiceSummary) {
        invoiceStatusMap[row.status] = {
          count: row._count._all,
          total: Math.round(Number(row._sum.total ?? 0)),
        };
      }

      // ── Cash flow = revenue inflow vs expense outflow per month ─────────────
      // We'll map the trend to cash flow and multiply by 100 because the cash flow chart 
      // divides by 100 to undo minor units (which it still expects!). 
      // Actually, since we return major units in trend, let's just make cashFlow major units and fix the chart 
      // to not expect minor units, or just multiply by 100 here to satisfy the chart's expectation of minor units.
      const cashFlow = trend.map((t) => ({
        month: t.month,
        inflow: t.revenue * 100,
        outflow: t.expenses * 100,
      }));

      // In trend, we left revenue/expenses as major units. ProfitComparison chart seems to expect major units directly.
      // E.g. `currency(Number(value) * 100)` wait, it multiplies by 100 then calls currency.
      // `CashFlowChart` uses `formatMoneyMinor(Number(value) * 100)`. So it treats `value` as major unit, multiplies by 100 to get minor, and formats.
      // So returning major units for `inflow`/`outflow` and `revenue`/`expenses` is perfect.
      const cashFlowMajor = trend.map((t) => ({
        month: t.month,
        actual: t.revenue,
        projected: t.expenses, // mocking projected with expenses for now
      }));

      return {
        trend,
        summary: {
          revenue: totalRevenue,
          expenses: totalExpenses,
          netProfit: totalRevenue - totalExpenses,
        },
        expenseCategories,
        cashFlow: cashFlowMajor,
        invoiceStatus: invoiceStatusMap,
        currency: baseCurrency,
      };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics." }, { status: 500 });
  }
}
