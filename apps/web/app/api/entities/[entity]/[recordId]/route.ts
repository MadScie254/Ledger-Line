import { Prisma, type PrismaClient } from "@ledgerline/db";
import { NextRequest, NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

interface EntityRecordRouteContext {
  params: Promise<{ entity: string; recordId: string }>;
}

type EntityKey = "customers" | "vendors" | "items" | "invoices" | "bills" | "expenses" | "payments";

export async function PATCH(request: Request, context: EntityRecordRouteContext) {
  try {
    const { entity, recordId } = await context.params;
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;
    const payload = (await request.json()) as Record<string, unknown>;

    const record = await withDatabase((prisma) =>
      updateEntityRecord(prisma, workspace.orgId, workspace.userId ?? "system", entity as EntityKey, recordId, payload)
    );

    return NextResponse.json({ record });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed." }, { status: 400 });
  }
}

async function updateEntityRecord(
  prisma: PrismaClient,
  orgId: string,
  userId: string,
  entity: EntityKey,
  recordId: string,
  payload: Record<string, unknown>
) {
  switch (entity) {
    case "customers": {
      const current = await prisma.customer.findFirst({ where: { id: recordId, orgId } });
      if (!current) {
        throw new Error("Customer not found.");
      }

      const row = await prisma.customer.update({
        where: { id: current.id },
        data: {
          displayName: requiredString(payload.title, "Customer name"),
          companyName: optionalString(payload.subtitle),
          emails: optionalString(payload.email) ? [optionalString(payload.email) as string] : undefined,
          phones: optionalString(payload.phone) ? [optionalString(payload.phone) as string] : undefined
        }
      });

      await audit(prisma, orgId, userId, "customer.updated", row.id, { after: { displayName: row.displayName } });
      return {
        id: row.id,
        title: row.displayName,
        subtitle: row.companyName,
        status: row.balance.gt(0) ? "Open balance" : "Current",
        amountMinor: decimalToMinor(row.balance),
        createdAt: new Date().toISOString(),
        metadata: { emails: row.emails, phones: row.phones }
      };
    }
    case "vendors": {
      const current = await prisma.vendor.findFirst({ where: { id: recordId, orgId } });
      if (!current) {
        throw new Error("Vendor not found.");
      }

      const row = await prisma.vendor.update({
        where: { id: current.id },
        data: {
          displayName: requiredString(payload.title, "Vendor name"),
          category: optionalString(payload.subtitle),
          emails: optionalString(payload.email) ? [optionalString(payload.email) as string] : undefined,
          phones: optionalString(payload.phone) ? [optionalString(payload.phone) as string] : undefined
        }
      });

      await audit(prisma, orgId, userId, "vendor.updated", row.id, { after: { displayName: row.displayName } });
      return {
        id: row.id,
        title: row.displayName,
        subtitle: row.category,
        status: row.balance.gt(0) ? "Payable" : "Current",
        amountMinor: decimalToMinor(row.balance),
        createdAt: new Date().toISOString(),
        metadata: { emails: row.emails, phones: row.phones }
      };
    }
    case "items": {
      const current = await prisma.product.findFirst({ where: { id: recordId, orgId } });
      if (!current) {
        throw new Error("Item not found.");
      }

      const row = await prisma.product.update({
        where: { id: current.id },
        data: {
          name: requiredString(payload.title, "Item name"),
          sku: optionalString(payload.subtitle),
          salesPrice:
            typeof payload.amountMinor === "number" && Number.isInteger(payload.amountMinor)
              ? new Prisma.Decimal(payload.amountMinor).div(100)
              : undefined,
          cost:
            typeof payload.costMinor === "number" && Number.isInteger(payload.costMinor)
              ? new Prisma.Decimal(payload.costMinor).div(100)
              : undefined,
          qtyOnHand:
            typeof payload.qtyOnHand === "number" && Number.isFinite(payload.qtyOnHand)
              ? new Prisma.Decimal(payload.qtyOnHand)
              : undefined
        }
      });

      await audit(prisma, orgId, userId, "product.updated", row.id, { after: { name: row.name, sku: row.sku } });
      return {
        id: row.id,
        title: row.name,
        subtitle: row.sku,
        status: row.type,
        amountMinor: decimalToMinor(row.salesPrice),
        createdAt: new Date().toISOString(),
        metadata: { qtyOnHand: row.qtyOnHand.toString(), costMinor: decimalToMinor(row.cost) }
      };
    }
    case "invoices": {
      const current = await prisma.invoice.findFirst({ where: { id: recordId, orgId } });
      if (!current) {
        throw new Error("Invoice not found.");
      }

      const row = await prisma.invoice.update({
        where: { id: current.id },
        data: {
          status: parseInvoiceStatus(payload.status),
          dueDate: optionalDate(payload.dueDate) ?? undefined,
          message: optionalString(payload.note)
        },
        include: { customer: { select: { displayName: true } } }
      });

      await audit(prisma, orgId, userId, "invoice.updated", row.id, { after: { status: row.status } });
      return {
        id: row.id,
        title: row.invoiceNo,
        subtitle: row.customer.displayName,
        status: row.status,
        amountMinor: decimalToMinor(row.total),
        createdAt: row.issueDate.toISOString(),
        metadata: { dueDate: row.dueDate.toISOString().slice(0, 10), balanceDueMinor: decimalToMinor(row.balanceDue) }
      };
    }
    case "bills": {
      const current = await prisma.bill.findFirst({ where: { id: recordId, orgId } });
      if (!current) {
        throw new Error("Bill not found.");
      }

      const row = await prisma.bill.update({
        where: { id: current.id },
        data: {
          status: parseBillStatus(payload.status),
          dueDate: optionalDate(payload.dueDate) ?? undefined
        },
        include: { vendor: { select: { displayName: true } } }
      });

      await audit(prisma, orgId, userId, "bill.updated", row.id, { after: { status: row.status } });
      return {
        id: row.id,
        title: row.billNo,
        subtitle: row.vendor.displayName,
        status: row.status,
        amountMinor: decimalToMinor(row.total),
        createdAt: row.billDate.toISOString(),
        metadata: { dueDate: row.dueDate.toISOString().slice(0, 10), unpaidMinor: decimalToMinor(row.total.sub(row.amountPaid)) }
      };
    }
    case "expenses": {
      const current = await prisma.expense.findFirst({ where: { id: recordId, orgId } });
      if (!current) {
        throw new Error("Expense not found.");
      }

      const row = await prisma.expense.update({
        where: { id: current.id },
        data: {
          payee: requiredString(payload.title, "Payee"),
          receiptUrl: optionalString(payload.subtitle)
        }
      });

      await audit(prisma, orgId, userId, "expense.updated", row.id, { after: { payee: row.payee } });
      return {
        id: row.id,
        title: row.payee,
        subtitle: row.receiptUrl,
        status: "Posted",
        amountMinor: decimalToMinor(row.amount),
        createdAt: row.date.toISOString(),
        metadata: { categoryAccountId: row.categoryAccountId, paymentAccountId: row.paymentAccountId }
      };
    }
    case "payments": {
      const current = await prisma.paymentReceived.findFirst({ where: { id: recordId, orgId } });
      if (!current) {
        throw new Error("Payment not found.");
      }

      const row = await prisma.paymentReceived.update({
        where: { id: current.id },
        data: {
          reference: requiredString(payload.title, "Reference"),
          method: optionalString(payload.status) ?? undefined
        },
        include: { customer: { select: { displayName: true } }, invoice: { select: { invoiceNo: true } } }
      });

      await audit(prisma, orgId, userId, "payment.updated", row.id, { after: { reference: row.reference } });
      return {
        id: row.id,
        title: row.reference ?? `Payment ${row.id.slice(0, 8)}`,
        subtitle: `${row.customer.displayName}${row.invoice ? ` · ${row.invoice.invoiceNo}` : ""}`,
        status: row.method,
        amountMinor: decimalToMinor(row.amount),
        createdAt: row.date.toISOString(),
        metadata: { invoiceId: row.invoiceId }
      };
    }
    default:
      throw new Error("Entity route is not registered.");
  }
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  return value.trim();
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseInvoiceStatus(value: unknown): "DRAFT" | "SENT" | "VIEWED" | "PARTIAL" | "PAID" | "OVERDUE" | "VOID" | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.toUpperCase();
  return ["DRAFT", "SENT", "VIEWED", "PARTIAL", "PAID", "OVERDUE", "VOID"].includes(normalized)
    ? (normalized as "DRAFT" | "SENT" | "VIEWED" | "PARTIAL" | "PAID" | "OVERDUE" | "VOID")
    : undefined;
}

function parseBillStatus(value: unknown): "OPEN" | "PARTIAL" | "PAID" | "OVERDUE" | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.toUpperCase();
  return ["OPEN", "PARTIAL", "PAID", "OVERDUE"].includes(normalized)
    ? (normalized as "OPEN" | "PARTIAL" | "PAID" | "OVERDUE")
    : undefined;
}

function decimalToMinor(amount: Prisma.Decimal) {
  return Number(amount.mul(100).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP).toString());
}

async function audit(
  prisma: PrismaClient,
  orgId: string,
  userId: string,
  action: string,
  entityId: string,
  diff: Prisma.InputJsonValue
) {
  await prisma.auditLogEntry.create({
    data: {
      orgId,
      userId,
      action,
      entityType: action.split(".")[0] ?? action,
      entityId,
      diff
    }
  });
}
