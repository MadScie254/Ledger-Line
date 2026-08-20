import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const payslips = await withDatabase(async (prisma) => {
      return prisma.payslip.findMany({
        where: {
          employee: { orgId: workspace.orgId }
        },
        include: {
          employee: { select: { id: true, name: true } },
          payRun: { select: { id: true, periodStart: true, periodEnd: true, status: true } },
        },
        orderBy: {
          payRun: { periodEnd: "desc" },
        },
      });
    });

    return NextResponse.json(payslips);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch payslips." },
      { status: 400 }
    );
  }
}
