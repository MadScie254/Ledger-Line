import { createWorkspaceRecord, listWorkspaceRecords } from "@ledgerline/db";
import { NextRequest, NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { getModuleDefinition } from "@/lib/module-registry";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

interface ModuleRouteContext {
  params: Promise<{ moduleKey: string }>;
}

export async function GET(request: Request, context: ModuleRouteContext) {
  try {
    const { moduleKey } = await context.params;
    const definition = getModuleDefinition(moduleKey);

    if (!definition) {
      return NextResponse.json({ error: "Module route is not registered." }, { status: 404 });
    }

    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;
    const records = await withDatabase((prisma) => listWorkspaceRecords(prisma, workspace.orgId, definition.moduleKey));

    return NextResponse.json({
      records: records.map((record) => ({
        id: record.id,
        title: record.title,
        subtitle: record.subtitle,
        status: record.status,
        amountMinor: record.amountMinor,
        createdAt: record.createdAt.toISOString()
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: formatError(error) }, { status: 400 });
  }
}

export async function POST(request: Request, context: ModuleRouteContext) {
  try {
    const { moduleKey } = await context.params;
    const definition = getModuleDefinition(moduleKey);

    if (!definition) {
      return NextResponse.json({ error: "Module route is not registered." }, { status: 404 });
    }

    const payload = await request.json() as {
      title?: unknown;
      subtitle?: unknown;
      status?: unknown;
      amountMinor?: unknown;
    };

    const title = typeof payload.title === "string" ? payload.title.trim() : "";

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 422 });
    }

    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;
    const record = await withDatabase((prisma) => createWorkspaceRecord(prisma, workspace, {
      moduleKey: definition.moduleKey,
      title,
      subtitle: typeof payload.subtitle === "string" ? payload.subtitle : null,
      status: typeof payload.status === "string" ? payload.status : "Draft",
      amountMinor: typeof payload.amountMinor === "number" && Number.isInteger(payload.amountMinor) ? payload.amountMinor : null
    }));

    return NextResponse.json({
      record: {
        id: record.id,
        title: record.title,
        subtitle: record.subtitle,
        status: record.status,
        amountMinor: record.amountMinor,
        createdAt: record.createdAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: formatError(error) }, { status: 400 });
  }
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : "Request failed.";
}
