import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Supabase Auth callback endpoint.
 *
 * After a user clicks the email confirmation link, Supabase redirects here
 * with a one-time `code` query parameter. We exchange it for a session and
 * then redirect the user to onboarding (new user) or the app root (existing).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // If the user has no org yet, send them to onboarding.
      const orgId = data.user.user_metadata?.orgId;
      const redirectTo = orgId ? next : "/onboarding";
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Exchange failed — redirect to error page.
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
