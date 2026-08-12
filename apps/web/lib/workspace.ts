import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Workspace context derived from a verified Supabase session.
 * Every API route and server component must obtain this via `requireWorkspace`.
 */
export interface WorkspaceContext {
  userId: string;
  orgId: string;
  email: string;
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
 *   const { orgId, userId } = ctx;
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
  // The orgId is stored in user.user_metadata.orgId after onboarding.
  const orgId: string | undefined = user.user_metadata?.orgId;

  if (!orgId) {
    return NextResponse.json(
      { error: "No organisation found. Please complete onboarding.", code: "ORG_REQUIRED" },
      { status: 403 }
    );
  }

  return {
    userId: user.id,
    orgId,
    email: user.email ?? "",
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

// ─── Legacy shim ─────────────────────────────────────────────────────────────
// Kept for gradual migration. New routes MUST use requireWorkspace().
// TODO: remove after all call sites are migrated.
const DEMO_ORG_ID = "org-ledgerline-demo";

/** @deprecated Use `requireWorkspace(request)` instead. */
export function getCurrentWorkspace() {
  return {
    orgId: process.env.LEDGERLINE_DEMO_ORG_ID ?? DEMO_ORG_ID,
    userId: process.env.LEDGERLINE_DEMO_USER_ID,
  };
}
