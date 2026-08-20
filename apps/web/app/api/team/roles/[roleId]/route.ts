import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { withDatabase } from "@/lib/database";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await props.params;
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const body = await request.json();
    const { name, permissions } = body;

    if (!name && !permissions) {
      return NextResponse.json({ error: "No update payload provided." }, { status: 400 });
    }

    const role = await withDatabase(async (prisma) => {
      // Prevent updating system roles
      const existing = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!existing || existing.orgId !== workspace.orgId) {
        throw new Error("NOT_FOUND");
      }

      if (existing.isSystemRole) {
        throw new Error("SYSTEM_ROLE");
      }

      return prisma.role.update({
        where: { id: roleId },
        data: {
          ...(name ? { name } : {}),
          ...(permissions ? { permissions } : {}),
        },
        include: {
          _count: { select: { memberships: true } },
        }
      });
    });

    return NextResponse.json({
      role: {
        id: role.id,
        name: role.name,
        isSystemRole: role.isSystemRole,
        permissions: role.permissions,
        memberCount: role._count.memberships,
      },
    });
  } catch (error: any) {
    console.error("Failed to update role:", error);
    if (error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Role not found." }, { status: 404 });
    }
    if (error.message === "SYSTEM_ROLE") {
      return NextResponse.json({ error: "System roles cannot be modified." }, { status: 400 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A role with this name already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update role." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await props.params;
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    await withDatabase(async (prisma) => {
      const existing = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
          _count: { select: { memberships: true } },
        }
      });

      if (!existing || existing.orgId !== workspace.orgId) {
        throw new Error("NOT_FOUND");
      }

      if (existing.isSystemRole) {
        throw new Error("SYSTEM_ROLE");
      }

      if (existing._count.memberships > 0) {
        throw new Error("HAS_MEMBERS");
      }

      return prisma.role.delete({
        where: { id: roleId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete role:", error);
    if (error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Role not found." }, { status: 404 });
    }
    if (error.message === "SYSTEM_ROLE") {
      return NextResponse.json({ error: "System roles cannot be deleted." }, { status: 400 });
    }
    if (error.message === "HAS_MEMBERS") {
      return NextResponse.json({ error: "Cannot delete a role that has assigned members." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete role." }, { status: 500 });
  }
}
