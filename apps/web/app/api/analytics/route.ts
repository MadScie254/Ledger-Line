import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { withDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const data = await withDatabase(async (prisma) => {
      // Basic mock aggregation for chart visualization
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentMonth = new Date().getMonth();
      
      const trend = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(currentMonth - (5 - i));
        
        // Generating some reasonable looking financials
        const baseRev = 35000 + (i * 3000);
        const baseExp = 18000 + (i * 1500);
        
        return {
          month: months[d.getMonth()],
          revenue: baseRev + Math.floor(Math.random() * 8000),
          expenses: baseExp + Math.floor(Math.random() * 5000),
        };
      });

      const totalRevenue = trend.reduce((sum, t) => sum + t.revenue, 0);
      const totalExpenses = trend.reduce((sum, t) => sum + t.expenses, 0);

      const expenseCategories = [
        { name: "Payroll", value: 24000 },
        { name: "Software", value: 4500 },
        { name: "Marketing", value: 8000 },
        { name: "Office", value: 2100 },
        { name: "Travel", value: 3200 },
      ];

      const cashFlow = trend.map(t => ({
        month: t.month,
        inflow: t.revenue + Math.floor(Math.random() * 2000),
        outflow: t.expenses + Math.floor(Math.random() * 2000),
      }));

      return {
        trend,
        summary: {
          revenue: totalRevenue,
          expenses: totalExpenses,
          netProfit: totalRevenue - totalExpenses,
        },
        expenseCategories,
        cashFlow,
      };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics." }, { status: 500 });
  }
}
