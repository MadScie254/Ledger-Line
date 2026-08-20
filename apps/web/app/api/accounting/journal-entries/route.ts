import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";
import { withDatabase } from "@/lib/database";
import { postJournalEntry } from "@ledgerline/ledger-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const entries = await withDatabase((prisma) =>
      prisma.journalEntry.findMany({
        where: { orgId: workspace.orgId },
        include: { 
          lines: {
            include: { account: true }
          }
        },
        orderBy: { entryDate: "desc" },
        take: 50,
      })
    );

    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error("Failed to fetch journal entries:", error);
    return NextResponse.json({ error: "Failed to fetch journal entries." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const body = await request.json();
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const entryInput = {
      orgId: workspace.orgId,
      entryDate: body.entryDate || new Date().toISOString(),
      memo: body.memo,
      referenceNo: body.referenceNo,
      sourceType: "manual" as const,
      createdBy: user?.id || "system",
      lines: body.lines, 
    };

    const entry = postJournalEntry(entryInput);

    await withDatabase(async (prisma) => {
      await prisma.journalEntry.create({
        data: {
          id: entry.id,
          orgId: entry.orgId,
          entryDate: entry.entryDate,
          memo: entry.memo,
          sourceType: (entry.sourceType?.toUpperCase() ?? "MANUAL") as any,
          sourceId: entry.sourceId,
          referenceNo: entry.referenceNo,
          postedAt: entry.postedAt,
          createdBy: entry.createdBy,
          lines: {
            create: entry.lines.map((line) => ({
              id: line.id,
              accountId: line.accountId,
              debitMinor: line.debitMinor,
              creditMinor: line.creditMinor,
              description: line.description,
            })),
          },
        },
      });
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create journal entry:", error);
    if (error.name === "LedgerValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create journal entry." }, { status: 500 });
  }
}
