import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const payRuns = await withDatabase(async (prisma) => {
      return prisma.payRun.findMany({
        where: { orgId: workspace.orgId },
        orderBy: { periodEnd: "desc" },
      });
    });

    return NextResponse.json(payRuns);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch pay runs." },
      { status: 400 }
    );
  }
}
