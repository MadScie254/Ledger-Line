import { assertBalancedLines } from "@ledgerline/ledger-service";
import { Prisma, type PrismaClient } from "@ledgerline/db";
import { minorToDecimal, decimalToMinor } from "@ledgerline/ledger-service";
import { NextRequest, NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

interface EntityRouteContext {
  params: Promise<{ entity: string }>;
}

type EntityKey = "customers" | "vendors" | "items" | "invoices" | "bills" | "expenses" | "payments" | "sales-receipts" | "sales-orders" | "etims-logs";

export async function GET(request: Request, context: EntityRouteContext) {
  try {
    const { entity } = await context.params;
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    return await withDatabase(async (prisma) => {
      const records = await listEntityRecords(prisma, workspace.orgId, entity as EntityKey);
      return NextResponse.json({ records, source: "live" });
    });
  } catch (error) {
    const { entity } = await context.params;

    

    return NextResponse.json({ error: formatError(error) }, { status: 400 });
  }
}

export async function POST(request: Request, context: EntityRouteContext) {
  try {
    const { entity } = await context.params;
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;
    const payload = (await request.json()) as Record<string, unknown>;

    return await withDatabase(async (prisma) => {
      const record = await createEntityRecord(prisma, workspace.orgId, workspace.userId ?? "system", entity as EntityKey, payload);
      return NextResponse.json({ record }, { status: 201 });
    });
  } catch (error) {
    return NextResponse.json({ error: formatError(error) }, { status: 400 });
  }
}

async function listEntityRecords(prisma: PrismaClient, orgId: string, entity: EntityKey) {
  switch (entity) {
    case "customers": {
      const rows = await prisma.customer.findMany({ where: { orgId }, orderBy: [{ displayName: "asc" }] });
      return rows.map((row) => ({
        id: row.id,
        title: row.displayName,
        subtitle: row.companyName,
        status: row.balance.gt(0) ? "Open balance" : "Current",
        amountMinor: decimalToMinor(row.balance),
        createdAt: new Date().toISOString(),
        metadata: { emails: row.emails, phones: row.phones }
      }));
    }
    case "vendors": {
      const rows = await prisma.vendor.findMany({ where: { orgId }, orderBy: [{ displayName: "asc" }] });
      return rows.map((row) => ({
        id: row.id,
        title: row.displayName,
        subtitle: row.category,
        status: row.balance.gt(0) ? "Payable" : "Current",
        amountMinor: decimalToMinor(row.balance),
        createdAt: new Date().toISOString(),
        metadata: { emails: row.emails, phones: row.phones }
      }));
    }
    case "items": {
      const rows = await prisma.product.findMany({ where: { orgId }, orderBy: [{ name: "asc" }] });
      return rows.map((row) => ({
        id: row.id,
        title: row.name,
        subtitle: row.sku,
        status: row.type,
        amountMinor: decimalToMinor(row.salesPrice),
        createdAt: new Date().toISOString(),
        metadata: { qtyOnHand: row.qtyOnHand.toString(), costMinor: decimalToMinor(row.cost) }
      }));
    }
    case "invoices": {
      const rows = await prisma.invoice.findMany({
        where: { orgId },
        include: { customer: { select: { displayName: true } } },
        orderBy: [{ issueDate: "desc" }]
      });
      return rows.map((row) => ({
        id: row.id,
        title: row.invoiceNo,
        subtitle: row.customer.displayName,
        status: row.status,
        amountMinor: decimalToMinor(row.total),
        createdAt: row.issueDate.toISOString(),
        metadata: { dueDate: row.dueDate.toISOString().slice(0, 10), balanceDueMinor: decimalToMinor(row.balanceDue) }
      }));
    }
    case "bills": {
      const rows = await prisma.bill.findMany({
        where: { orgId },
        include: { vendor: { select: { displayName: true } } },
        orderBy: [{ billDate: "desc" }]
      });
      return rows.map((row) => ({
        id: row.id,
        title: row.billNo,
        subtitle: row.vendor.displayName,
        status: row.status,
        amountMinor: decimalToMinor(row.total),
        createdAt: row.billDate.toISOString(),
        metadata: { dueDate: row.dueDate.toISOString().slice(0, 10), unpaidMinor: decimalToMinor(row.total.sub(row.amountPaid)) }
      }));
    }
    case "expenses": {
      const rows = await prisma.expense.findMany({ where: { orgId }, orderBy: [{ date: "desc" }] });
      return rows.map((row) => ({
        id: row.id,
        title: row.payee,
        subtitle: row.receiptUrl,
        status: "Posted",
        amountMinor: decimalToMinor(row.amount),
        createdAt: row.date.toISOString(),
        metadata: { categoryAccountId: row.categoryAccountId, paymentAccountId: row.paymentAccountId }
      }));
    }
    case "payments": {
      const rows = await prisma.paymentReceived.findMany({
        where: { orgId },
        include: { customer: { select: { displayName: true } }, invoice: { select: { invoiceNo: true } } },
        orderBy: [{ date: "desc" }]
      });
      return rows.map((row) => ({
        id: row.id,
        title: row.reference ?? `Payment ${row.id.slice(0, 8)}`,
        subtitle: `${row.customer.displayName}${row.invoice ? ` · ${row.invoice.invoiceNo}` : ""}`,
        status: row.method,
        amountMinor: decimalToMinor(row.amount),
        createdAt: row.date.toISOString(),
        metadata: { invoiceId: row.invoiceId }
      }));
    }
    case "sales-receipts": {
      const rows = await prisma.salesReceipt.findMany({
        where: { orgId },
        include: { customer: { select: { displayName: true } } },
        orderBy: [{ date: "desc" }]
      });
      return rows.map((row) => ({
        id: row.id,
        title: `Receipt ${row.id.slice(0, 8).toUpperCase()}`,
        subtitle: row.customer?.displayName ?? "Walk-in",
        status: "Paid",
        amountMinor: 0,
        createdAt: row.date.toISOString(),
        metadata: { paymentMethod: row.paymentMethod }
      }));
    }
    case "sales-orders": {
      const rows = await prisma.salesOrder.findMany({
        where: { orgId },
        include: { customer: { select: { displayName: true } } },
        orderBy: [{ id: "desc" }]
      });
      return rows.map((row) => ({
        id: row.id,
        title: `SO-${row.id.slice(0, 8).toUpperCase()}`,
        subtitle: row.customer?.displayName ?? "—",
        status: row.status,
        amountMinor: 0,
        createdAt: new Date().toISOString(),
        metadata: { fulfillmentStatus: row.fulfillmentStatus ?? "Pending" }
      }));
    }
    case "etims-logs": {
      // Mocked eTIMS logs
      return [
        { id: "log-1", title: "Transmission Success", subtitle: "Invoice 105", status: "Success", amountMinor: 0, createdAt: new Date(Date.now() - 1000 * 60).toISOString(), metadata: { error: null } },
        { id: "log-2", title: "Transmission Success", subtitle: "Invoice 104", status: "Success", amountMinor: 0, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), metadata: { error: null } },
        { id: "log-3", title: "Transmission Failed", subtitle: "Invoice 103", status: "Failed", amountMinor: 0, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), metadata: { error: "KRA PIN Invalid" } },
        { id: "log-4", title: "Transmission Success", subtitle: "Receipt RC-001", status: "Success", amountMinor: 0, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), metadata: { error: null } },
        { id: "log-5", title: "Transmission Success", subtitle: "Invoice 102", status: "Success", amountMinor: 0, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), metadata: { error: null } },
      ];
    }
    default:
      throw new Error("Entity route is not registered.");
  }
}
async function createEntityRecord(prisma: PrismaClient, orgId: string, userId: string, entity: EntityKey, payload: Record<string, unknown>) {
  switch (entity) {
    case "customers": {
      const name = requiredString(payload.title, "Customer name");
      const companyName = optionalString(payload.subtitle);
      const email = optionalString(payload.email);
      const phone = optionalString(payload.phone);

      const row = await prisma.customer.create({
        data: {
          orgId,
          displayName: name,
          companyName,
          emails: email ? [email] : [],
          phones: phone ? [phone] : [],
          tags: []
        }
      });

      await audit(prisma, orgId, userId, "customer.created", row.id, { after: { displayName: row.displayName } });
      return {
        id: row.id,
        title: row.displayName,
        subtitle: row.companyName,
        status: "Current",
        amountMinor: 0,
        createdAt: new Date().toISOString(),
        metadata: { emails: row.emails, phones: row.phones }
      };
    }
    case "vendors": {
      const name = requiredString(payload.title, "Vendor name");
      const category = optionalString(payload.subtitle);
      const email = optionalString(payload.email);
      const phone = optionalString(payload.phone);

      const row = await prisma.vendor.create({
        data: {
          orgId,
          displayName: name,
          category,
          emails: email ? [email] : [],
          phones: phone ? [phone] : []
        }
      });

      await audit(prisma, orgId, userId, "vendor.created", row.id, { after: { displayName: row.displayName } });
      return {
        id: row.id,
        title: row.displayName,
        subtitle: row.category,
        status: "Current",
        amountMinor: 0,
        createdAt: new Date().toISOString(),
        metadata: { emails: row.emails, phones: row.phones }
      };
    }
    case "items": {
      const name = requiredString(payload.title, "Item name");
      const sku = optionalString(payload.subtitle);
      const salesPriceMinor = optionalInteger(payload.amountMinor) ?? 0;
      const costMinor = optionalInteger(payload.costMinor) ?? 0;
      const qtyOnHand = optionalNumber(payload.qtyOnHand) ?? 0;

      const row = await prisma.product.create({
        data: {
          orgId,
          name,
          sku,
          type: "INVENTORY",
          salesPrice: minorToDecimal(salesPriceMinor),
          cost: minorToDecimal(costMinor),
          qtyOnHand: new Prisma.Decimal(qtyOnHand)
        }
      });

      await audit(prisma, orgId, userId, "product.created", row.id, { after: { name: row.name, sku: row.sku } });
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
      const invoiceNo = requiredString(payload.title, "Invoice number");
      const customerName = requiredString(payload.subtitle, "Customer name");
      const totalMinor = optionalInteger(payload.amountMinor);
      const issueDate = optionalDate(payload.issueDate) ?? new Date();
      const dueDate = optionalDate(payload.dueDate) ?? issueDate;

      if (!totalMinor || totalMinor <= 0) {
        throw new Error("Invoice amount must be greater than zero.");
      }

      return prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findFirst({ where: { orgId, displayName: customerName } });
        if (!customer) {
          throw new Error("Customer not found. Create customer first.");
        }

        const row = await tx.invoice.create({
          data: {
            orgId,
            customerId: customer.id,
            invoiceNo,
            issueDate,
            dueDate,
            status: "SENT",
            subtotal: minorToDecimal(totalMinor),
            total: minorToDecimal(totalMinor),
            balanceDue: minorToDecimal(totalMinor)
          }
        });

        const receivable = await findAccountByCode(tx, orgId, "1200");
        const income = await findAccountByCode(tx, orgId, "4000");

        const lines = [
          { accountId: receivable.id, debitMinor: totalMinor, creditMinor: 0 },
          { accountId: income.id, debitMinor: 0, creditMinor: totalMinor }
        ];

        assertBalancedLines(lines);

        const journalEntry = await tx.journalEntry.create({
          data: {
            orgId,
            entryDate: issueDate,
            memo: `Invoice ${invoiceNo}`,
            sourceType: "INVOICE",
            sourceId: row.id,
            referenceNo: invoiceNo,
            createdBy: userId,
            lines: {
              create: lines.map((line) => ({
                accountId: line.accountId,
                debit: minorToDecimal(line.debitMinor),
                credit: minorToDecimal(line.creditMinor),
                entityType: "Invoice",
                entityId: row.id
              }))
            }
          }
        });

        await audit(tx, orgId, userId, "invoice.created", row.id, { after: { invoiceNo: row.invoiceNo, totalMinor } });

        return {
          id: row.id,
          title: row.invoiceNo,
          subtitle: customer.displayName,
          status: row.status,
          amountMinor: totalMinor,
          createdAt: row.issueDate.toISOString(),
          metadata: { dueDate: row.dueDate.toISOString().slice(0, 10), journalEntryId: journalEntry.id }
        };
      });
    }
    case "bills": {
      const billNo = requiredString(payload.title, "Bill number");
      const vendorName = requiredString(payload.subtitle, "Vendor name");
      const totalMinor = optionalInteger(payload.amountMinor);
      const billDate = optionalDate(payload.billDate) ?? new Date();
      const dueDate = optionalDate(payload.dueDate) ?? billDate;
      const categoryCode = optionalString(payload.categoryAccountCode) ?? "5000";

      if (!totalMinor || totalMinor <= 0) {
        throw new Error("Bill amount must be greater than zero.");
      }

      return prisma.$transaction(async (tx) => {
        const vendor = await tx.vendor.findFirst({ where: { orgId, displayName: vendorName } });
        if (!vendor) {
          throw new Error("Vendor not found. Create vendor first.");
        }

        const row = await tx.bill.create({
          data: {
            orgId,
            vendorId: vendor.id,
            billNo,
            billDate,
            dueDate,
            subtotal: minorToDecimal(totalMinor),
            total: minorToDecimal(totalMinor)
          }
        });

        const payable = await findAccountByCode(tx, orgId, "2000");
        const expense = await findAccountByCode(tx, orgId, categoryCode);
        const lines = [
          { accountId: expense.id, debitMinor: totalMinor, creditMinor: 0 },
          { accountId: payable.id, debitMinor: 0, creditMinor: totalMinor }
        ];
        assertBalancedLines(lines);

        await tx.journalEntry.create({
          data: {
            orgId,
            entryDate: billDate,
            memo: `Bill ${billNo}`,
            sourceType: "BILL",
            sourceId: row.id,
            referenceNo: billNo,
            createdBy: userId,
            lines: {
              create: lines.map((line) => ({
                accountId: line.accountId,
                debit: minorToDecimal(line.debitMinor),
                credit: minorToDecimal(line.creditMinor),
                entityType: "Bill",
                entityId: row.id
              }))
            }
          }
        });

        await audit(tx, orgId, userId, "bill.created", row.id, { after: { billNo: row.billNo, totalMinor } });

        return {
          id: row.id,
          title: row.billNo,
          subtitle: vendor.displayName,
          status: row.status,
          amountMinor: totalMinor,
          createdAt: row.billDate.toISOString(),
          metadata: { dueDate: row.dueDate.toISOString().slice(0, 10) }
        };
      });
    }
    case "expenses": {
      const payee = requiredString(payload.title, "Payee");
      const amountMinor = optionalInteger(payload.amountMinor);
      const date = optionalDate(payload.expenseDate) ?? new Date();
      const categoryCode = optionalString(payload.categoryAccountCode) ?? "6300";
      const paymentCode = optionalString(payload.paymentAccountCode) ?? "1000";

      if (!amountMinor || amountMinor <= 0) {
        throw new Error("Expense amount must be greater than zero.");
      }

      return prisma.$transaction(async (tx) => {
        const category = await findAccountByCode(tx, orgId, categoryCode);
        const payment = await findAccountByCode(tx, orgId, paymentCode);

        const row = await tx.expense.create({
          data: {
            orgId,
            payee,
            date,
            amount: minorToDecimal(amountMinor),
            categoryAccountId: category.id,
            paymentAccountId: payment.id
          }
        });

        const lines = [
          { accountId: category.id, debitMinor: amountMinor, creditMinor: 0 },
          { accountId: payment.id, debitMinor: 0, creditMinor: amountMinor }
        ];
        assertBalancedLines(lines);

        await tx.journalEntry.create({
          data: {
            orgId,
            entryDate: date,
            memo: `Expense ${payee}`,
            sourceType: "EXPENSE",
            sourceId: row.id,
            referenceNo: `EXP-${row.id.slice(0, 8)}`,
            createdBy: userId,
            lines: {
              create: lines.map((line) => ({
                accountId: line.accountId,
                debit: minorToDecimal(line.debitMinor),
                credit: minorToDecimal(line.creditMinor),
                entityType: "Expense",
                entityId: row.id
              }))
            }
          }
        });

        await audit(tx, orgId, userId, "expense.created", row.id, { after: { payee: row.payee, amountMinor } });

        return {
          id: row.id,
          title: row.payee,
          subtitle: null,
          status: "Posted",
          amountMinor,
          createdAt: row.date.toISOString(),
          metadata: { categoryAccountCode: category.code, paymentAccountCode: payment.code }
        };
      });
    }
    case "payments": {
      const reference = requiredString(payload.title, "Reference");
      const customerName = requiredString(payload.subtitle, "Customer name");
      const amountMinor = optionalInteger(payload.amountMinor);
      const paymentDate = optionalDate(payload.paymentDate) ?? new Date();
      const method = optionalString(payload.method) ?? "bank";
      const invoiceNo = optionalString(payload.invoiceNo);
      const depositCode = optionalString(payload.depositAccountCode) ?? "1000";

      if (!amountMinor || amountMinor <= 0) {
        throw new Error("Payment amount must be greater than zero.");
      }

      return prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findFirst({ where: { orgId, displayName: customerName } });
        if (!customer) {
          throw new Error("Customer not found. Create customer first.");
        }

        const invoice = invoiceNo
          ? await tx.invoice.findFirst({ where: { orgId, invoiceNo } })
          : null;

        const depositAccount = await findAccountByCode(tx, orgId, depositCode);
        const row = await tx.paymentReceived.create({
          data: {
            orgId,
            customerId: customer.id,
            invoiceId: invoice?.id,
            amount: minorToDecimal(amountMinor),
            date: paymentDate,
            method,
            depositAccountId: depositAccount.id,
            reference
          }
        });

        if (invoice) {
          const nextAmountPaid = invoice.amountPaid.add(minorToDecimal(amountMinor));
          const nextBalance = invoice.total.sub(nextAmountPaid);
          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              amountPaid: nextAmountPaid,
              balanceDue: nextBalance.lt(0) ? new Prisma.Decimal(0) : nextBalance,
              status: nextBalance.lte(0) ? "PAID" : "PARTIAL"
            }
          });
        }

        const receivable = await findAccountByCode(tx, orgId, "1200");
        const lines = [
          { accountId: depositAccount.id, debitMinor: amountMinor, creditMinor: 0 },
          { accountId: receivable.id, debitMinor: 0, creditMinor: amountMinor }
        ];
        assertBalancedLines(lines);

        await tx.journalEntry.create({
          data: {
            orgId,
            entryDate: paymentDate,
            memo: `Payment ${reference}`,
            sourceType: "PAYMENT",
            sourceId: row.id,
            referenceNo: reference,
            createdBy: userId,
            lines: {
              create: lines.map((line) => ({
                accountId: line.accountId,
                debit: minorToDecimal(line.debitMinor),
                credit: minorToDecimal(line.creditMinor),
                entityType: "PaymentReceived",
                entityId: row.id
              }))
            }
          }
        });

        await audit(tx, orgId, userId, "payment.created", row.id, { after: { reference: row.reference, amountMinor } });

        return {
          id: row.id,
          title: row.reference ?? `Payment ${row.id.slice(0, 8)}`,
          subtitle: customer.displayName,
          status: row.method,
          amountMinor,
          createdAt: row.date.toISOString(),
          metadata: { invoiceNo: invoice?.invoiceNo ?? null }
        };
      });
    }
    case "sales-receipts": {
      const receiptCustomerName = optionalString(payload.subtitle);
      const paymentMethod = optionalString(payload.paymentMethod) ?? "cash";
      const depositCode = optionalString(payload.depositAccountCode) ?? "1000";
      const receiptDate = optionalDate(payload.date) ?? new Date();

      return prisma.$transaction(async (tx) => {
        const customer = receiptCustomerName
          ? await tx.customer.findFirst({ where: { orgId, displayName: receiptCustomerName } })
          : null;
        const depositAccount = await findAccountByCode(tx, orgId, depositCode);

        const row = await tx.salesReceipt.create({
          data: {
            orgId,
            customerId: customer?.id,
            date: receiptDate,
            lines: payload.lines ?? [],
            paymentMethod,
            depositAccountId: depositAccount.id
          }
        });

        await audit(tx, orgId, userId, "sales-receipt.created", row.id, { after: { paymentMethod, date: receiptDate } });

        return {
          id: row.id,
          title: `Receipt ${row.id.slice(0, 8).toUpperCase()}`,
          subtitle: customer?.displayName ?? "Walk-in",
          status: "Paid",
          amountMinor: 0,
          createdAt: row.date.toISOString(),
          metadata: { paymentMethod: row.paymentMethod }
        };
      });
    }
    case "sales-orders": {
      const orderCustomerName = optionalString(payload.subtitle);
      const orderStatus = optionalString(payload.status) ?? "DRAFT";

      return prisma.$transaction(async (tx) => {
        const customer = orderCustomerName
          ? await tx.customer.findFirst({ where: { orgId, displayName: orderCustomerName } })
          : null;

        const row = await tx.salesOrder.create({
          data: {
            orgId,
            customerId: customer?.id,
            lines: payload.lines ?? [],
            status: orderStatus,
            fulfillmentStatus: "Pending"
          }
        });

        await audit(tx, orgId, userId, "sales-order.created", row.id, { after: { status: orderStatus } });

        return {
          id: row.id,
          title: `SO-${row.id.slice(0, 8).toUpperCase()}`,
          subtitle: customer?.displayName ?? "—",
          status: row.status,
          amountMinor: 0,
          createdAt: new Date().toISOString(),
          metadata: { fulfillmentStatus: row.fulfillmentStatus ?? "Pending" }
        };
      });
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

function optionalInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function optionalDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function findAccountByCode(prisma: Prisma.TransactionClient | PrismaClient, orgId: string, code: string) {
  const account = await prisma.account.findFirst({ where: { orgId, code } });

  if (!account) {
    throw new Error(`Account ${code} is not configured in the active organization.`);
  }

  return account;
}

function formatError(error: unknown) {
  

  if (error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === "P2002") {
    return "A duplicate unique value already exists for this entity.";
  }

  return error instanceof Error ? error.message : "Request failed.";
}

async function audit(
  prisma: Prisma.TransactionClient | PrismaClient,
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
