import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withDatabase } from "@/lib/database";

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

  const orgId = user?.app_metadata?.orgId;
  if (!orgId) {
    redirect("/onboarding");
  }

  // Fetch org name for the sidebar header
  let orgName = "My Organisation";
  try {
    orgName = await withDatabase(async (prisma) => {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { name: true },
      });
      return org?.name ?? "My Organisation";
    });
  } catch {
    // non-fatal — use default
  }

  return <AppShell orgName={orgName}>{children}</AppShell>;
}
