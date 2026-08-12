import { assertBalancedLines , minorToDecimal, decimalToMinor } from "@ledgerline/ledger-service";
import { Prisma, type PrismaClient } from "@ledgerline/db";
import { NextRequest, NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

type ImportTarget = "accounts" | "customers" | "vendors" | "products" | "invoices" | "opening_balances";

interface ImportRow {
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;
    const batches = await withDatabase((prisma) =>
      prisma.importBatch.findMany({
        where: { orgId: workspace.orgId },
        orderBy: [{ createdAt: "desc" }],
        take: 100
      })
    );

    return NextResponse.json({
      batches: batches.map((batch) => ({
        id: batch.id,
        targetType: batch.targetType,
        fileName: batch.fileName,
        totalRows: batch.totalRows,
        successRows: batch.successRows,
        failedRows: batch.failedRows,
        status: batch.status,
        importedBy: batch.importedBy,
        createdAt: batch.createdAt.toISOString(),
        reversedAt: batch.reversedAt?.toISOString() ?? null
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      targetType?: unknown;
      fileName?: unknown;
      rows?: unknown;
    };

    const targetType = typeof payload.targetType === "string" ? payload.targetType : "";
    const fileName = typeof payload.fileName === "string" ? payload.fileName : "import.csv";
    const rows = Array.isArray(payload.rows) ? (payload.rows as ImportRow[]) : [];

    if (!isTargetType(targetType)) {
      return NextResponse.json({ error: "Invalid target type." }, { status: 422 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "No rows were provided for import." }, { status: 422 });
    }

    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;
    const userId = workspace.userId ?? "system";

    const batch = await withDatabase((prisma) =>
      prisma.$transaction(async (tx) => {
        const createdRecords = await commitRows(tx, workspace.orgId, userId, targetType, rows);

        const importBatch = await tx.importBatch.create({
          data: {
            orgId: workspace.orgId,
            targetType,
            fileName,
            totalRows: rows.length,
            successRows: createdRecords.length,
            failedRows: 0,
            status: "committed",
            createdRecordIds: { records: createdRecords as Prisma.InputJsonValue[] } satisfies Prisma.InputJsonObject,
            importedBy: userId
          }
        });

        await tx.auditLogEntry.create({
          data: {
            orgId: workspace.orgId,
            userId,
            action: "import.committed",
            entityType: "ImportBatch",
            entityId: importBatch.id,
            diff: {
              targetType,
              fileName,
              totalRows: rows.length,
              successRows: createdRecords.length
            }
          }
        });

        return importBatch;
      })
    );

    return NextResponse.json({
      batch: {
        id: batch.id,
        targetType: batch.targetType,
        fileName: batch.fileName,
        totalRows: batch.totalRows,
        successRows: batch.successRows,
        failedRows: batch.failedRows,
        status: batch.status,
        importedBy: batch.importedBy,
        createdAt: batch.createdAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed." }, { status: 400 });
  }
}

async function commitRows(
  prisma: Prisma.TransactionClient,
  orgId: string,
  userId: string,
  targetType: ImportTarget,
  rows: ImportRow[]
) {
  const created: Array<Record<string, unknown>> = [];

  if (targetType === "accounts") {
    for (const row of rows) {
      const code = requiredString(row.code ?? row.accountCode, "Account code");
      const name = requiredString(row.name, "Account name");
      const type = normalizeAccountType(row.type);

      const account = await prisma.account.create({
        data: {
          orgId,
          code,
          name,
          type,
          subtype: optionalString(row.subtype)
        }
      });

      created.push({ type: "account", id: account.id, code: account.code });
    }

    return created;
  }

  if (targetType === "customers") {
    for (const row of rows) {
      const displayName = requiredString(row.displayName ?? row.name, "Customer name");
      const customer = await prisma.customer.create({
        data: {
          orgId,
          displayName,
          companyName: optionalString(row.companyName),
          emails: optionalString(row.email) ? [optionalString(row.email) as string] : [],
          phones: optionalString(row.phone) ? [optionalString(row.phone) as string] : [],
          tags: []
        }
      });

      created.push({ type: "customer", id: customer.id, displayName: customer.displayName });
    }

    return created;
  }

  if (targetType === "vendors") {
    for (const row of rows) {
      const displayName = requiredString(row.displayName ?? row.name, "Vendor name");
      const vendor = await prisma.vendor.create({
        data: {
          orgId,
          displayName,
          category: optionalString(row.category),
          emails: optionalString(row.email) ? [optionalString(row.email) as string] : [],
          phones: optionalString(row.phone) ? [optionalString(row.phone) as string] : []
        }
      });

      created.push({ type: "vendor", id: vendor.id, displayName: vendor.displayName });
    }

    return created;
  }

  if (targetType === "products") {
    for (const row of rows) {
      const name = requiredString(row.name, "Product name");
      const salesPriceMinor = optionalInteger(row.salesPriceMinor ?? row.salesPrice) ?? 0;
      const costMinor = optionalInteger(row.costMinor ?? row.cost) ?? 0;
      const qtyOnHand = optionalNumber(row.qtyOnHand) ?? 0;

      const product = await prisma.product.create({
        data: {
          orgId,
          name,
          sku: optionalString(row.sku),
          type: "INVENTORY",
          salesPrice: minorToDecimal(salesPriceMinor),
          cost: minorToDecimal(costMinor),
          qtyOnHand: new Prisma.Decimal(qtyOnHand)
        }
      });

      created.push({ type: "product", id: product.id, name: product.name });
    }

    return created;
  }

  if (targetType === "invoices") {
    for (const row of rows) {
      const invoiceNo = requiredString(row.invoiceNo, "Invoice number");
      const customerName = requiredString(row.customerName ?? row.customer, "Customer name");
      const totalMinor = optionalInteger(row.totalMinor ?? row.amountMinor);
      const issueDate = optionalDate(row.issueDate) ?? new Date();
      const dueDate = optionalDate(row.dueDate) ?? issueDate;

      if (!totalMinor || totalMinor <= 0) {
        throw new Error(`Invoice ${invoiceNo} has an invalid amount.`);
      }

      const customer = await prisma.customer.findFirst({ where: { orgId, displayName: customerName } });
      if (!customer) {
        throw new Error(`Customer '${customerName}' was not found for invoice ${invoiceNo}.`);
      }

      const invoice = await prisma.invoice.create({
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

      const receivable = await findAccountByCode(prisma, orgId, "1200");
      const income = await findAccountByCode(prisma, orgId, "4000");
      const lines = [
        { accountId: receivable.id, debitMinor: totalMinor, creditMinor: 0 },
        { accountId: income.id, debitMinor: 0, creditMinor: totalMinor }
      ];
      assertBalancedLines(lines);

      const journalEntry = await prisma.journalEntry.create({
        data: {
          orgId,
          entryDate: issueDate,
          memo: `Invoice import ${invoiceNo}`,
          sourceType: "INVOICE",
          sourceId: invoice.id,
          referenceNo: invoiceNo,
          createdBy: userId,
          lines: {
            create: lines.map((line) => ({
              accountId: line.accountId,
              debit: minorToDecimal(line.debitMinor),
              credit: minorToDecimal(line.creditMinor),
              entityType: "Invoice",
              entityId: invoice.id
            }))
          }
        }
      });

      created.push({ type: "invoice", id: invoice.id, journalEntryId: journalEntry.id, invoiceNo: invoice.invoiceNo });
    }

    return created;
  }

  const grouped = new Map<string, ImportRow[]>();
  for (const row of rows) {
    const key = requiredString(row.entryKey ?? row.reference, "Entry key");
    const list = grouped.get(key) ?? [];
    list.push(row);
    grouped.set(key, list);
  }

  for (const [entryKey, groupRows] of grouped.entries()) {
    const entryDate = optionalDate(groupRows[0]?.entryDate ?? groupRows[0]?.date) ?? new Date();
    const memo = optionalString(groupRows[0]?.memo) ?? `Imported opening balance ${entryKey}`;

    const lines = [] as Array<{ accountId: string; debitMinor: number; creditMinor: number; description: string }>;
    for (const row of groupRows) {
      const accountCode = requiredString(row.accountCode, "Account code");
      const account = await findAccountByCode(prisma, orgId, accountCode);
      const debitMinor = optionalInteger(row.debitMinor) ?? 0;
      const creditMinor = optionalInteger(row.creditMinor) ?? 0;
      lines.push({ accountId: account.id, debitMinor, creditMinor, description: optionalString(row.description) ?? accountCode });
    }

    assertBalancedLines(lines);

    const journalEntry = await prisma.journalEntry.create({
      data: {
        orgId,
        entryDate,
        memo,
        sourceType: "ADJUSTMENT",
        sourceId: entryKey,
        referenceNo: entryKey,
        createdBy: userId,
        lines: {
          create: lines.map((line) => ({
            accountId: line.accountId,
            debit: minorToDecimal(line.debitMinor),
            credit: minorToDecimal(line.creditMinor),
            description: line.description,
            entityType: "OpeningBalanceImport",
            entityId: entryKey
          }))
        }
      }
    });

    created.push({ type: "journal-entry", id: journalEntry.id, reference: journalEntry.referenceNo });
  }

  return created;
}

async function findAccountByCode(prisma: Prisma.TransactionClient, orgId: string, code: string) {
  const account = await prisma.account.findFirst({ where: { orgId, code } });
  if (!account) {
    throw new Error(`Account ${code} is not configured.`);
  }

  return account;
}

function isTargetType(value: string): value is ImportTarget {
  return ["accounts", "customers", "vendors", "products", "invoices", "opening_balances"].includes(value);
}

function normalizeAccountType(value: unknown): "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "COGS" | "EXPENSE" {
  if (typeof value !== "string") {
    throw new Error("Account type is required.");
  }

  const next = value.toUpperCase();
  if (["ASSET", "LIABILITY", "EQUITY", "INCOME", "COGS", "EXPENSE"].includes(next)) {
    return next as "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "COGS" | "EXPENSE";
  }

  throw new Error(`Unsupported account type '${value}'.`);
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


