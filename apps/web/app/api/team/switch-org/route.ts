import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminAuthClient } from "@/lib/supabase/admin";
import { withDatabase } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const targetOrgId = body.orgId;

    if (!targetOrgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    // Verify user actually belongs to this org
    const membership = await withDatabase(async (prisma) => {
      return prisma.orgMembership.findUnique({
        where: {
          userId_orgId: {
            userId: user.id,
            orgId: targetOrgId,
          },
        },
      });
    });

    if (!membership || membership.status !== "ACTIVE") {
      return NextResponse.json({ error: "Invalid membership" }, { status: 403 });
    }

    // Update app_metadata
    const { error: updateError } = await adminAuthClient.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: {
          ...user.app_metadata,
          orgId: targetOrgId,
        },
      }
    );

    if (updateError) {
      console.error("Failed to update user app_metadata:", updateError);
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
    }

    // Instruct the client that the switch was successful.
    // The client MUST call supabase.auth.refreshSession() after receiving this 200 OK.
    return NextResponse.json({ success: true, orgId: targetOrgId });
  } catch (error: any) {
    console.error("Switch org error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
