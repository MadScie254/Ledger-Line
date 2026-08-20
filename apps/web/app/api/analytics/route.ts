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

      return {
        trend,
        summary: {
          revenue: totalRevenue,
          expenses: totalExpenses,
          netProfit: totalRevenue - totalExpenses,
        }
      };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics." }, { status: 500 });
  }
}
