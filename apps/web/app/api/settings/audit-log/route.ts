import { NextRequest, NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();
    const entityType = searchParams.get("entityType")?.trim();

    const entries = await withDatabase((prisma) =>
      prisma.auditLogEntry.findMany({
        where: {
          orgId: workspace.orgId,
          ...(entityType ? { entityType } : {}),
          ...(query
            ? {
                OR: [
                  { action: { contains: query, mode: "insensitive" } },
                  { entityId: { contains: query, mode: "insensitive" } },
                  { entityType: { contains: query, mode: "insensitive" } }
                ]
              }
            : {})
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: [{ createdAt: "desc" }],
        take: 300
      })
    );

    return NextResponse.json({
      entries: entries.map((entry) => ({
        id: entry.id,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        user: entry.user?.name ?? entry.user?.email ?? entry.userId ?? "system",
        createdAt: entry.createdAt.toISOString(),
        diff: entry.diff
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed." }, { status: 400 });
  }
}
