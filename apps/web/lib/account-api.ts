import type { AccountType } from "@ledgerline/db";
import { NextResponse } from "next/server";

const accountTypes = new Set<AccountType>(["ASSET", "LIABILITY", "EQUITY", "INCOME", "COGS", "EXPENSE"]);

export async function parseAccountInput(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" ? body.type : "";
  const subtype = typeof body.subtype === "string" ? body.subtype.trim() : null;
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

  if (!/^\d{3,8}$/.test(code)) {
    throw new RequestValidationError("Account code must contain 3 to 8 digits.");
  }

  if (name.length < 2 || name.length > 120) {
    throw new RequestValidationError("Account name must contain between 2 and 120 characters.");
  }

  if (!accountTypes.has(type as AccountType)) {
    throw new RequestValidationError("Choose a valid account type.");
  }

  return {
    code,
    name,
    type: type as AccountType,
    subtype,
    isActive
  };
}

export class RequestValidationError extends Error {}

export function serializeAccount(account: {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subtype: string | null;
  currency: string;
  isActive: boolean;
}, lineCount = 0) {
  return { ...account, lineCount };
}

export function errorResponse(error: unknown) {
  if (error instanceof RequestValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isPrismaUniqueError(error)) {
    return NextResponse.json({ error: "An account with this code already exists in the active organization." }, { status: 409 });
  }

  if (error instanceof Error && error.message.includes("not found")) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  console.error("Account API request failed", error);
  return NextResponse.json({ error: "Ledgerline could not complete this account request." }, { status: 500 });
}

function isPrismaUniqueError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "P2002";
}
