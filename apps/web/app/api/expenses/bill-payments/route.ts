import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const payments = await withDatabase(async (prisma) => {
      return prisma.billPayment.findMany({
        where: { orgId: workspace.orgId },
        include: {
          bill: { select: { id: true, billNo: true, vendor: { select: { displayName: true } } } },
        },
        orderBy: { date: "desc" },
      });
    });

    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch bill payments." },
      { status: 400 }
    );
  }
}
