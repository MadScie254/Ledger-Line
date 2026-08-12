import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Auth guard for all protected app routes.
 *
 * Runs server-side on every render within the `(app)` group.
 * - No session  → redirect to /login
 * - No org yet  → redirect to /onboarding
 * - Otherwise   → render the AppShell with the active workspace context
 */
export default async function ProductLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orgId: string | undefined = user.user_metadata?.orgId;
  if (!orgId) {
    redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}
