import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { withDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const memberships = await withDatabase((prisma) =>
      prisma.orgMembership.findMany({
        where: { orgId: workspace.orgId },
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          role: { select: { id: true, name: true } }
        },
        orderBy: { user: { name: "asc" } }
      })
    );

    return NextResponse.json({
      users: memberships.map((m) => ({
        id: m.userId,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        roleId: m.roleId,
        roleName: m.role.name,
        status: m.status
      }))
    });
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}
