import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withDatabase } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await withDatabase(async (prisma) => {
      return prisma.orgMembership.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        include: { org: true },
      });
    });

    return NextResponse.json(memberships);
  } catch (error: any) {
    console.error("Failed to fetch memberships:", error);
    return NextResponse.json({ error: "Failed to fetch memberships" }, { status: 500 });
  }
}
