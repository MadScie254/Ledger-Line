import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const rules = await withDatabase(async (prisma) => {
      return prisma.bankRule.findMany({
        where: { orgId: workspace.orgId },
        orderBy: { priority: "asc" },
      });
    });

    return NextResponse.json(rules);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch bank rules." },
      { status: 400 }
    );
  }
}
