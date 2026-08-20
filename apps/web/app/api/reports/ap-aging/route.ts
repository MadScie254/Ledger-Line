import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { differenceInDays } from "date-fns";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const today = new Date();

    const bills = await withDatabase(async (prisma) => {
      return prisma.bill.findMany({
        where: {
          orgId: workspace.orgId,
          status: { in: ["OPEN", "PARTIAL", "OVERDUE"] },
        },
        include: {
          vendor: { select: { displayName: true } },
        },
        orderBy: { dueDate: "asc" },
      });
    });

    const rows = bills.map((bill) => {
      const daysOverdue = differenceInDays(today, new Date(bill.dueDate));
      const bucket =
        daysOverdue <= 0 ? "current" :
        daysOverdue <= 30 ? "1-30" :
        daysOverdue <= 60 ? "31-60" :
        daysOverdue <= 90 ? "61-90" : "90+";

      const balanceDue = Number(bill.total) - Number(bill.amountPaid);

      return {
        id: bill.id,
        billNo: bill.billNo,
        vendorName: bill.vendor.displayName,
        billDate: bill.billDate.toISOString(),
        dueDate: bill.dueDate.toISOString(),
        balanceDue: balanceDue.toString(),
        currency: bill.currency,
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
      { error: error instanceof Error ? error.message : "Failed to build AP aging." },
      { status: 400 }
    );
  }
}
