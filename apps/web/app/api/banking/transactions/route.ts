import { minorToDecimal, decimalToMinor } from "@ledgerline/ledger-service";
import { Prisma } from "@ledgerline/db";
import { NextRequest, NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const transactions = await withDatabase((prisma) =>
      prisma.bankTransaction.findMany({
        where: { bankConnection: { orgId: workspace.orgId } },
        include: {
          bankConnection: { select: { institutionName: true } }
        },
        orderBy: [{ date: "desc" }],
        take: 200
      })
    );

    const records = transactions.map((row) => ({
      id: row.id,
      description: row.description,
      date: row.date.toISOString().slice(0, 10),
      status: row.status,
      direction: row.direction,
      amountMinor: decimalToMinor(row.amount),
      institution: row.bankConnection.institutionName
    }));

    return NextResponse.json({ records, signals: buildSignals(records) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      description?: unknown;
      amountMinor?: unknown;
      direction?: unknown;
      date?: unknown;
    };

    const description = typeof payload.description === "string" ? payload.description.trim() : "";
    const amountMinor = typeof payload.amountMinor === "number" && Number.isInteger(payload.amountMinor) ? payload.amountMinor : null;
    const direction = payload.direction === "IN" || payload.direction === "OUT" ? payload.direction : null;
    const date = typeof payload.date === "string" && payload.date ? new Date(payload.date) : new Date();

    if (!description || !amountMinor || amountMinor <= 0 || !direction || Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Description, amount, direction, and date are required." }, { status: 422 });
    }

    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;

    const record = await withDatabase(async (prisma) => {
      let connection = await prisma.bankConnection.findFirst({ where: { orgId: workspace.orgId } });

      if (!connection) {
        connection = await prisma.bankConnection.create({
          data: {
            orgId: workspace.orgId,
            institutionName: "Manual Feed",
            accountNoMasked: "****0001",
            provider: "manual"
          }
        });
      }

      const transaction = await prisma.bankTransaction.create({
        data: {
          bankConnectionId: connection.id,
          date,
          description,
          amount: new Prisma.Decimal(amountMinor).div(100),
          direction,
          status: "UNREVIEWED"
        },
        include: {
          bankConnection: { select: { institutionName: true } }
        }
      });

      await prisma.auditLogEntry.create({
        data: {
          orgId: workspace.orgId,
          userId: workspace.userId,
          action: "bank-transaction.created",
          entityType: "BankTransaction",
          entityId: transaction.id,
          diff: {
            description: transaction.description,
            amountMinor
          }
        }
      });

      return transaction;
    });

    return NextResponse.json({
      record: {
        id: record.id,
        description: record.description,
        date: record.date.toISOString().slice(0, 10),
        status: record.status,
        direction: record.direction,
        amountMinor,
        institution: record.bankConnection.institutionName
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed." }, { status: 400 });
  }
}


interface TransactionRecord {
  id: string;
  description: string;
  date: string;
  status: string;
  direction: string;
  amountMinor: number;
  institution: string;
}

function buildSignals(records: TransactionRecord[]) {
  const signals: Array<{ kind: "spike" | "duplicate"; title: string; detail: string; transactionId: string }> = [];

  const sorted = [...records].sort((left, right) => left.date.localeCompare(right.date));
  const byVendor = new Map<string, TransactionRecord[]>();

  for (const record of sorted) {
    const key = vendorKey(record.description);
    const list = byVendor.get(key) ?? [];
    list.push(record);
    byVendor.set(key, list);

    const duplicates = list.filter((candidate) => candidate.id !== record.id && candidate.amountMinor === record.amountMinor && Math.abs(daysBetween(candidate.date, record.date)) <= 3);
    if (duplicates.length > 0) {
      signals.push({
        kind: "duplicate",
        title: "Likely duplicate transaction",
        detail: `${record.description} looks similar to a transaction from the last 3 days.`,
        transactionId: record.id
      });
    }

    const prior = list.filter((candidate) => candidate.id !== record.id);
    if (prior.length >= 3) {
      const average = prior.reduce((total, candidate) => total + candidate.amountMinor, 0) / prior.length;
      if (average > 0 && record.amountMinor > average * 1.4) {
        const jump = Math.round(((record.amountMinor - average) / average) * 100);
        signals.push({
          kind: "spike",
          title: "Amount spike detected",
          detail: `${record.description} is ${jump}% above this vendor's usual amount.`,
          transactionId: record.id
        });
      }
    }
  }

  return signals.slice(0, 20);
}

function vendorKey(description: string) {
  return description.toLowerCase().replace(/\d+/g, "").trim().slice(0, 20);
}

function daysBetween(leftDate: string, rightDate: string) {
  const left = new Date(leftDate);
  const right = new Date(rightDate);
  const diff = Math.abs(right.getTime() - left.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

