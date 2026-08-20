import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const periods = await withDatabase(async (prisma) => {
      return prisma.accountingPeriod.findMany({
        where: { orgId: workspace.orgId },
        include: {
          closedByUser: { select: { name: true, email: true } }
        },
        orderBy: { endDate: "desc" },
      });
    });

    return NextResponse.json(periods);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch accounting periods." },
      { status: 400 }
    );
  }
}
