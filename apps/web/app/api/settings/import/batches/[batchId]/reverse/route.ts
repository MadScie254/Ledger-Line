import { Prisma } from "@ledgerline/db";
import { NextRequest, NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

interface ReverseRouteContext {
  params: Promise<{ batchId: string }>;
}

export async function POST(request: Request, context: ReverseRouteContext) {
  try {
    const { batchId } = await context.params;
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;
    const userId = workspace.userId ?? "system";

    const batch = await withDatabase((prisma) =>
      prisma.$transaction(async (tx) => {
        const current = await tx.importBatch.findFirst({ where: { id: batchId, orgId: workspace.orgId } });
        if (!current) {
          throw new Error("Import batch not found.");
        }

        if (current.status === "reversed") {
          throw new Error("This import batch is already reversed.");
        }

        const records = extractRecords(current.createdRecordIds);
        await reverseRecords(tx, workspace.orgId, userId, current.targetType, records);

        const updated = await tx.importBatch.update({
          where: { id: current.id },
          data: {
            status: "reversed",
            reversedAt: new Date()
          }
        });

        await tx.auditLogEntry.create({
          data: {
            orgId: workspace.orgId,
            userId,
            action: "import.reversed",
            entityType: "ImportBatch",
            entityId: current.id,
            diff: {
              targetType: current.targetType,
              reversedAt: updated.reversedAt
            }
          }
        });

        return updated;
      })
    );

    return NextResponse.json({
      batch: {
        id: batch.id,
        status: batch.status,
        reversedAt: batch.reversedAt?.toISOString() ?? null
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Reverse failed." }, { status: 400 });
  }
}

async function reverseRecords(
  prisma: Prisma.TransactionClient,
  orgId: string,
  userId: string,
  targetType: string,
  records: Array<Record<string, unknown>>
) {
  if (targetType === "accounts") {
    const ids = records.map((row) => row.id).filter((id): id is string => typeof id === "string");
    await prisma.account.deleteMany({ where: { orgId, id: { in: ids } } });
    return;
  }

  if (targetType === "customers") {
    const ids = records.map((row) => row.id).filter((id): id is string => typeof id === "string");
    await prisma.customer.deleteMany({ where: { orgId, id: { in: ids } } });
    return;
  }

  if (targetType === "vendors") {
    const ids = records.map((row) => row.id).filter((id): id is string => typeof id === "string");
    await prisma.vendor.deleteMany({ where: { orgId, id: { in: ids } } });
    return;
  }

  if (targetType === "products") {
    const ids = records.map((row) => row.id).filter((id): id is string => typeof id === "string");
    await prisma.product.deleteMany({ where: { orgId, id: { in: ids } } });
    return;
  }

  if (targetType === "invoices") {
    for (const record of records) {
      const invoiceId = typeof record.id === "string" ? record.id : null;
      const journalEntryId = typeof record.journalEntryId === "string" ? record.journalEntryId : null;
      if (!invoiceId || !journalEntryId) {
        continue;
      }

      await createReversal(prisma, orgId, userId, journalEntryId, `Reverse invoice import ${invoiceId}`);
      await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "VOID" } });
    }

    return;
  }

  for (const record of records) {
    const journalEntryId = typeof record.id === "string" ? record.id : null;
    if (!journalEntryId) {
      continue;
    }

    await createReversal(prisma, orgId, userId, journalEntryId, `Reverse opening balance import ${journalEntryId}`);
  }
}

async function createReversal(
  prisma: Prisma.TransactionClient,
  orgId: string,
  userId: string,
  journalEntryId: string,
  memo: string
) {
  const original = await prisma.journalEntry.findFirst({
    where: { id: journalEntryId, orgId },
    include: { lines: true }
  });

  if (!original) {
    return;
  }

  await prisma.journalEntry.create({
    data: {
      orgId,
      entryDate: new Date(),
      memo,
      sourceType: "ADJUSTMENT",
      sourceId: original.id,
      referenceNo: `REV-${original.referenceNo ?? original.id.slice(0, 8)}`,
      createdBy: userId,
      lines: {
        create: original.lines.map((line) => ({
          accountId: line.accountId,
          debit: line.credit,
          credit: line.debit,
          description: `Reverse ${line.description ?? "line"}`,
          entityType: line.entityType,
          entityId: line.entityId
        }))
      }
    }
  });
}

function extractRecords(value: Prisma.JsonValue) {
  if (typeof value !== "object" || value === null || !("records" in value)) {
    return [] as Array<Record<string, unknown>>;
  }

  const records = (value as { records?: unknown }).records;
  return Array.isArray(records) ? (records.filter((record) => typeof record === "object" && record !== null) as Array<Record<string, unknown>>) : [];
}
