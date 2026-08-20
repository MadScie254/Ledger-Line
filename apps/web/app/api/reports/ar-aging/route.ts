import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { differenceInDays } from "date-fns";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const today = new Date();

    const invoices = await withDatabase(async (prisma) => {
      return prisma.invoice.findMany({
        where: {
          orgId: workspace.orgId,
          status: { in: ["SENT", "VIEWED", "PARTIAL", "OVERDUE"] },
        },
        include: {
          customer: { select: { displayName: true } },
        },
        orderBy: { dueDate: "asc" },
      });
    });

    const rows = invoices.map((inv) => {
      const daysOverdue = differenceInDays(today, new Date(inv.dueDate));
      const bucket =
        daysOverdue <= 0 ? "current" :
        daysOverdue <= 30 ? "1-30" :
        daysOverdue <= 60 ? "31-60" :
        daysOverdue <= 90 ? "61-90" : "90+";

      return {
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        customerName: inv.customer.displayName,
        issueDate: inv.issueDate.toISOString(),
        dueDate: inv.dueDate.toISOString(),
        balanceDue: inv.balanceDue.toString(),
        currency: inv.currency,
        daysOverdue: Math.max(0, daysOverdue),
        bucket,
      };
    });

    // Bucket totals
    const buckets = { current: 0, "1-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
    for (const row of rows) {
      buckets[row.bucket as keyof typeof buckets] += Math.round(Number(row.balanceDue) * 100);
    }

    return NextResponse.json({ rows, buckets });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to build AR aging." },
      { status: 400 }
    );
  }
}
