import type { Prisma, PrismaClient, WorkspaceRecord } from "@prisma/client";

interface WorkspaceContext {
  orgId: string;
  userId?: string;
}

export interface WorkspaceRecordInput {
  moduleKey: string;
  title: string;
  subtitle?: string | null;
  status?: string | null;
  amountMinor?: number | null;
  metadata?: Prisma.InputJsonValue;
}

export async function listWorkspaceRecords(prisma: PrismaClient, orgId: string, moduleKey: string) {
  return prisma.workspaceRecord.findMany({
    where: { orgId, moduleKey },
    orderBy: [{ createdAt: "desc" }]
  });
}

export async function createWorkspaceRecord(prisma: PrismaClient, context: WorkspaceContext, input: WorkspaceRecordInput) {
  return prisma.$transaction(async (tx) => {
    const record = await tx.workspaceRecord.create({
      data: {
        orgId: context.orgId,
        moduleKey: input.moduleKey,
        title: input.title,
        subtitle: cleanString(input.subtitle),
        status: cleanString(input.status),
        amountMinor: input.amountMinor ?? null,
        metadata: input.metadata,
        createdBy: context.userId ?? null
      }
    });

    await writeAuditLog(tx, context, "workspace-record.created", record.id, {
      after: recordSnapshot(record)
    });

    return record;
  });
}

export async function updateWorkspaceRecord(
  prisma: PrismaClient,
  context: WorkspaceContext,
  recordId: string,
  moduleKey: string,
  input: WorkspaceRecordInput
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.workspaceRecord.findFirst({
      where: { id: recordId, orgId: context.orgId, moduleKey }
    });

    if (!current) {
      throw new Error("Record not found in the active organization.");
    }

    const record = await tx.workspaceRecord.update({
      where: { id: current.id },
      data: {
        title: input.title,
        subtitle: cleanString(input.subtitle),
        status: cleanString(input.status),
        amountMinor: input.amountMinor ?? null,
        metadata: input.metadata
      }
    });

    await writeAuditLog(tx, context, "workspace-record.updated", record.id, {
      before: recordSnapshot(current),
      after: recordSnapshot(record)
    });

    return record;
  });
}

function cleanString(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

function recordSnapshot(record: WorkspaceRecord) {
  return {
    amountMinor: record.amountMinor,
    metadata: record.metadata,
    moduleKey: record.moduleKey,
    status: record.status,
    subtitle: record.subtitle,
    title: record.title
  } satisfies Prisma.InputJsonObject;
}

async function writeAuditLog(
  tx: Prisma.TransactionClient,
  context: WorkspaceContext,
  action: string,
  entityId: string,
  diff: Prisma.InputJsonValue
) {
  await tx.auditLogEntry.create({
    data: {
      orgId: context.orgId,
      userId: context.userId,
      action,
      entityType: "WorkspaceRecord",
      entityId,
      diff
    }
  });
}
