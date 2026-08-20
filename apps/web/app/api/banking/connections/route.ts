import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const connections = await withDatabase(async (prisma) => {
      return prisma.bankConnection.findMany({
        where: { orgId: workspace.orgId },
        orderBy: { institutionName: "asc" },
      });
    });

    return NextResponse.json(connections);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch bank connections." },
      { status: 400 }
    );
  }
}
