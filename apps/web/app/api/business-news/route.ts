import { fetchKenyaBusinessNews } from "@/lib/business-news";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Cache the news feed for 3 hours server-side
export const revalidate = 10800;

export async function GET() {
  try {
    const items = await fetchKenyaBusinessNews("Kenya business finance", 10);
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch news." },
      { status: 500 }
    );
  }
}
