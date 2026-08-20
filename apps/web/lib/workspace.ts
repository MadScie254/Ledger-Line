import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withDatabase } from "@/lib/database";

/**
 * Workspace context derived from a verified Supabase session.
 * Every API route and server component must obtain this via `requireWorkspace`.
 */
export interface WorkspaceContext {
  userId: string;
  orgId: string;
  email: string;
  /** ISO 4217 currency code for the organisation's base currency (e.g. "KES"). */
  baseCurrency: string;
}

/**
 * Reads the Supabase session from cookies (maintained by middleware),
 * verifies the user is authenticated, and resolves the active organisation.
 *
 * Throws a 401/403 NextResponse if:
 *   - No session exists (not logged in)
 *   - The user has no org membership (not yet onboarded)
 *
 * Usage in a Route Handler:
 *   ```ts
 *   const ctx = await requireWorkspace(request);
 *   if (ctx instanceof NextResponse) return ctx; // 401/403
 *   const { orgId, userId, baseCurrency } = ctx;
 *   ```
 */
export async function requireWorkspace(
  _request?: Request | NextRequest
): Promise<WorkspaceContext | NextResponse> {
  const supabase = await createSupabaseServerClient();

  // getUser() hits the Supabase auth server — never trust cached data here.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Unauthorized", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  // Resolve org from the OrgMembership table via user's metadata or DB lookup.
  // The orgId is stored in user.app_metadata.orgId after onboarding.
  const orgId: string | undefined = user.app_metadata?.orgId;

  if (!orgId) {
    return NextResponse.json(
      { error: "No organisation found. Please complete onboarding.", code: "ORG_REQUIRED" },
      { status: 403 }
    );
  }

  // Fetch the org's base currency from the database.
  let baseCurrency = "KES";
  try {
    const org = await withDatabase((prisma) =>
      prisma.organization.findUnique({
        where: { id: orgId },
        select: { baseCurrency: true },
      })
    );
    if (org?.baseCurrency) {
      baseCurrency = org.baseCurrency;
    }
  } catch {
    // Non-fatal: fall back to KES if DB call fails
  }

  return {
    userId: user.id,
    orgId,
    email: user.email ?? "",
    baseCurrency,
  };
}

/**
 * Type guard: returns true if the result is an error response, not a context.
 */
export function isWorkspaceError(
  result: WorkspaceContext | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}

// Legacy shims removed.
