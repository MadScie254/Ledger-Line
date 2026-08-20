import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const transactions = await withDatabase(async (prisma) => {
      return prisma.bankTransaction.findMany({
        where: {
          connection: { orgId: workspace.orgId },
          status: "UNREVIEWED"
        },
        include: {
          connection: { select: { institutionName: true, currency: true } }
        },
        orderBy: { date: "desc" },
      });
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch transactions." },
      { status: 400 }
    );
  }
}
