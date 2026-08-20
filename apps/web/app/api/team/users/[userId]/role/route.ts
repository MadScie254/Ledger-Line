import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { withDatabase } from "@/lib/database";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await props.params;
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const body = await request.json();
    const { roleId } = body;

    if (!roleId || typeof roleId !== "string") {
      return NextResponse.json({ error: "roleId is required." }, { status: 400 });
    }

    await withDatabase(async (prisma) => {
      // Verify role belongs to org
      const role = await prisma.role.findUnique({ where: { id: roleId } });
      if (!role || role.orgId !== workspace.orgId) {
        throw new Error("ROLE_NOT_FOUND");
      }

      return prisma.orgMembership.update({
        where: {
          userId_orgId: {
            userId: userId,
            orgId: workspace.orgId
          }
        },
        data: { roleId }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update user role:", error);
    if (error.message === "ROLE_NOT_FOUND") {
      return NextResponse.json({ error: "Role not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update user role." }, { status: 500 });
  }
}
