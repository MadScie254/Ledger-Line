import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const org = await withDatabase(async (prisma) => {
      return prisma.organization.findUnique({
        where: { id: workspace.orgId },
      });
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(org);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch organization." },
      { status: 400 }
    );
  }
}
