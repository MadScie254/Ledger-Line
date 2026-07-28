import { updateAccount } from "@ledgerline/db";
import { NextResponse } from "next/server";
import { errorResponse, parseAccountInput, serializeAccount } from "@/lib/account-api";
import { withDatabase } from "@/lib/database";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

interface AccountRouteContext {
  params: Promise<{ accountId: string }>;
}

export async function PATCH(request: Request, context: AccountRouteContext) {
  try {
    const input = await parseAccountInput(request);
    const { accountId } = await context.params;
    const workspace = getCurrentWorkspace();
    const account = await withDatabase((prisma) => updateAccount(prisma, workspace, accountId, input));

    return NextResponse.json({ account: serializeAccount(account, 0) });
  } catch (error) {
    return errorResponse(error);
  }
}
