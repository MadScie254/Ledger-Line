import { createAccount, listAccounts } from "@ledgerline/db";
import { NextResponse } from "next/server";
import { errorResponse, parseAccountInput, serializeAccount } from "@/lib/account-api";
import { withDatabase } from "@/lib/database";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

export async function GET() {
  try {
    const workspace = getCurrentWorkspace();
    const accounts = await withDatabase((prisma) => listAccounts(prisma, workspace.orgId));

    return NextResponse.json({
      accounts: accounts.map((account) => ({
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        currency: account.currency,
        isActive: account.isActive,
        lineCount: account._count.lines
      }))
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = await parseAccountInput(request);
    const workspace = getCurrentWorkspace();
    const account = await withDatabase((prisma) => createAccount(prisma, workspace, input));

    return NextResponse.json({ account: serializeAccount(account, 0) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
