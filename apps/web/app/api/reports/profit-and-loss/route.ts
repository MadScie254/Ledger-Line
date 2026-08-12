import { NextRequest, NextResponse } from "next/server";
import { withDatabase } from "@/lib/database";
import { requireWorkspace, isWorkspaceError } from "@/lib/workspace";

export const runtime = "nodejs";

interface ProfitAndLossLine {
  accountId: string;
  code: string;
  name: string;
  type: string;
  movementMinor: number;
}

interface ProfitAndLossResponse {
  startDate: string;
  endDate: string;
  totalIncomeMinor: number;
  totalCostMinor: number;
  totalExpenseMinor: number;
  grossProfitMinor: number;
  netProfitMinor: number;
  lineCount: number;
  topLines: ProfitAndLossLine[];
}

export async function GET(request: Request) {
  try {
    const workspace = await requireWorkspace(request);
    if (isWorkspaceError(workspace)) return workspace;
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const startDate = searchParams.get("start") ? new Date(searchParams.get("start")!) : new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const endDate = searchParams.get("end") ? new Date(searchParams.get("end")!) : now;

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date range." }, { status: 422 });
    }

    const report = await withDatabase(async (prisma) => {
      const lines = await prisma.journalLine.findMany({
        where: {
          journalEntry: {
            orgId: workspace.orgId,
            entryDate: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        include: {
          account: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true
            }
          }
        }
      });

      const accountMap = new Map<string, ProfitAndLossLine>();
      let totalIncomeMinor = 0;
      let totalCostMinor = 0;
      let totalExpenseMinor = 0;

      for (const line of lines) {
        const movementMinor = numberForAccountingLine(line.debit.toString(), line.credit.toString(), line.account.type);
        const current = accountMap.get(line.accountId) ?? {
          accountId: line.accountId,
          code: line.account.code,
          name: line.account.name,
          type: line.account.type,
          movementMinor: 0
        };

        current.movementMinor += movementMinor;
        accountMap.set(line.accountId, current);

        if (line.account.type === "INCOME") {
          totalIncomeMinor += movementMinor;
        } else if (line.account.type === "COGS") {
          totalCostMinor += movementMinor;
        } else if (line.account.type === "EXPENSE") {
          totalExpenseMinor += movementMinor;
        }
      }

      const topLines = Array.from(accountMap.values())
        .filter((line) => line.type === "INCOME" || line.type === "COGS" || line.type === "EXPENSE")
        .sort((left, right) => Math.abs(right.movementMinor) - Math.abs(left.movementMinor))
        .slice(0, 8);

      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalIncomeMinor,
        totalCostMinor,
        totalExpenseMinor,
        grossProfitMinor: totalIncomeMinor - totalCostMinor,
        netProfitMinor: totalIncomeMinor - totalCostMinor - totalExpenseMinor,
        lineCount: lines.length,
        topLines
      } satisfies ProfitAndLossResponse;
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to build profit and loss report." }, { status: 400 });
  }
}

function numberForAccountingLine(debit: string, credit: string, type: string) {
  const debitValue = Number(debit);
  const creditValue = Number(credit);

  if (type === "INCOME" || type === "LIABILITY" || type === "EQUITY") {
    return creditValue - debitValue;
  }

  return debitValue - creditValue;
}
