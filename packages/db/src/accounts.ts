import type { AccountType, Prisma, PrismaClient } from "@prisma/client";

export interface AccountMutationInput {
  code: string;
  name: string;
  type: AccountType;
  subtype?: string | null;
  isActive?: boolean;
}

interface AccountMutationContext {
  orgId: string;
  userId?: string;
}

export async function listAccounts(prisma: PrismaClient, orgId: string) {
  return prisma.account.findMany({
    where: { orgId },
    orderBy: [{ code: "asc" }],
    include: {
      _count: {
        select: { lines: true }
      }
    }
  });
}

export async function createAccount(prisma: PrismaClient, context: AccountMutationContext, input: AccountMutationInput) {
  return prisma.$transaction(async (tx) => {
    const account = await tx.account.create({
      data: {
        orgId: context.orgId,
        code: input.code,
        name: input.name,
        type: input.type,
        subtype: input.subtype?.trim() || null,
        isActive: input.isActive ?? true
      }
    });

    await writeAuditLog(tx, context, "account.created", account.id, { after: account });
    return account;
  });
}

export async function updateAccount(
  prisma: PrismaClient,
  context: AccountMutationContext,
  accountId: string,
  input: AccountMutationInput
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.account.findFirst({
      where: { id: accountId, orgId: context.orgId },
      include: { _count: { select: { lines: true } } }
    });

    if (!current) {
      throw new Error("Account not found in the active organization.");
    }

    if (current.type !== input.type && current._count.lines > 0) {
      throw new Error("An account type cannot change after journal lines have been posted.");
    }

    const account = await tx.account.update({
      where: { id: current.id },
      data: {
        code: input.code,
        name: input.name,
        type: input.type,
        subtype: input.subtype?.trim() || null,
        isActive: input.isActive ?? true
      }
    });

    await writeAuditLog(tx, context, "account.updated", account.id, { before: current, after: account });
    return account;
  });
}

async function writeAuditLog(
  tx: Prisma.TransactionClient,
  context: AccountMutationContext,
  action: string,
  entityId: string,
  diff: Prisma.InputJsonValue
) {
  await tx.auditLogEntry.create({
    data: {
      orgId: context.orgId,
      userId: context.userId,
      action,
      entityType: "Account",
      entityId,
      diff
    }
  });
}
