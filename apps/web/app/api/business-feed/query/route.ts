import { decimalToMinor } from "@ledgerline/ledger-service";
import { Prisma, PrismaClient } from "@ledgerline/db";
import { NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { question?: unknown };
    const question = typeof payload.question === "string" ? payload.question.trim() : "";

    if (!question) {
      return NextResponse.json({ error: "Question is required." }, { status: 422 });
    }

    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;
    const answer = await withDatabase((prisma) => answerQuestion(prisma as unknown as PrismaClient, workspace.orgId, workspace.baseCurrency, question));
    return NextResponse.json(answer);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Query failed." }, { status: 400 });
  }
}

async function answerQuestion(prisma: PrismaClient, orgId: string, currency: string, question: string) {
  const normalized = question.toLowerCase();

  if (normalized.includes("profit")) {
    const start = startOfMonth();
    const end = endOfMonth();

    const entries = await prisma.journalLine.findMany({
      where: {
        journalEntry: { orgId, entryDate: { gte: start, lte: end } }
      },
      include: {
        account: {
          select: { type: true }
        }
      }
    });

    let incomeMinor = 0;
    let cogsMinor = 0;
    let expenseMinor = 0;

    for (const line of entries) {
      const debit = decimalToMinor(line.debit);
      const credit = decimalToMinor(line.credit);
      if (line.account.type === "INCOME") {
        incomeMinor += credit - debit;
      }
      if (line.account.type === "COGS") {
        cogsMinor += debit - credit;
      }
      if (line.account.type === "EXPENSE") {
        expenseMinor += debit - credit;
      }
    }

    const netProfitMinor = incomeMinor - cogsMinor - expenseMinor;
    return {
      answer: `Net profit this month is ${currency} ${(netProfitMinor / 100).toLocaleString()}.`,
      valueMinor: netProfitMinor,
      reportLink: "/reports/profit-and-loss"
    };
  }

  if (normalized.includes("invoice") || normalized.includes("receivable")) {
    const [openCount, paidCount, openTotal] = await Promise.all([
      prisma.invoice.count({ where: { orgId, status: { in: ["SENT", "VIEWED", "PARTIAL", "OVERDUE"] } } }),
      prisma.invoice.count({ where: { orgId, status: "PAID" } }),
      prisma.invoice.aggregate({ where: { orgId, status: { in: ["SENT", "VIEWED", "PARTIAL", "OVERDUE"] } }, _sum: { balanceDue: true } })
    ]);

    const openTotalMinor = openTotal._sum.balanceDue ? decimalToMinor(openTotal._sum.balanceDue) : 0;

    return {
      answer: `You have ${openCount} open invoices and ${paidCount} paid invoices. Open balance is ${currency} ${(openTotalMinor / 100).toLocaleString()}.`,
      valueMinor: openTotalMinor,
      reportLink: "/reports/ar-aging"
    };
  }

  if (normalized.includes("cash") || normalized.includes("bank")) {
    const accounts = await prisma.account.findMany({ where: { orgId, code: { in: ["1000", "1010"] } }, select: { id: true, code: true } });
    const accountIds = accounts.map((account) => account.id);
    const lines = await prisma.journalLine.findMany({ where: { accountId: { in: accountIds }, journalEntry: { orgId } } });

    let balanceMinor = 0;
    for (const line of lines) {
      balanceMinor += decimalToMinor(line.debit) - decimalToMinor(line.credit);
    }

    return {
      answer: `Current cash across bank and till accounts is ${currency} ${(balanceMinor / 100).toLocaleString()}.`,
      valueMinor: balanceMinor,
      reportLink: "/reports/cash-flow"
    };
  }

  return {
    answer: "Try asking about profit, invoices, receivables, or cash position.",
    valueMinor: null,
    reportLink: "/reports"
  };
}

function startOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function endOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}


