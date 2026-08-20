import { NextResponse } from "next/server";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    // Fixed mock data for stable chart renders across sessions as requested
    const data = [
      { name: "Jan", revenue: 4000, expense: 2400 },
      { name: "Feb", revenue: 4200, expense: 2100 },
      { name: "Mar", revenue: 4800, expense: 2300 },
      { name: "Apr", revenue: 3900, expense: 1900 },
      { name: "May", revenue: 5100, expense: 2600 },
      { name: "Jun", revenue: 6200, expense: 3100 },
    ];

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
