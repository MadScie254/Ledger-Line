import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { withDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const roles = await withDatabase((prisma) =>
      prisma.role.findMany({
        where: { orgId: workspace.orgId },
        include: {
          _count: { select: { memberships: true } },
        },
        orderBy: [{ isSystemRole: "desc" }, { name: "asc" }],
      })
    );

    return NextResponse.json({
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        isSystemRole: role.isSystemRole,
        permissions: role.permissions,
        memberCount: role._count.memberships,
      })),
    });
  } catch (error: any) {
    console.error("Failed to fetch roles:", error);
    return NextResponse.json({ error: "Failed to fetch roles." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const body = await request.json();
    const { name, permissions } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Role name is required." }, { status: 400 });
    }

    if (!permissions || typeof permissions !== "object") {
      return NextResponse.json({ error: "Role permissions are required." }, { status: 400 });
    }

    const role = await withDatabase((prisma) =>
      prisma.role.create({
        data: {
          orgId: workspace.orgId,
          name,
          permissions,
          isSystemRole: false,
        },
      })
    );

    return NextResponse.json({
      role: {
        id: role.id,
        name: role.name,
        isSystemRole: role.isSystemRole,
        permissions: role.permissions,
        memberCount: 0,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create role:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A role with this name already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create role." }, { status: 500 });
  }
}
