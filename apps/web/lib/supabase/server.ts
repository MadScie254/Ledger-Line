import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates an @supabase/ssr server client that reads/writes cookies.
 * This is the ONLY place in the codebase that constructs a Supabase client
 * for server-side rendering. All Server Components, Route Handlers, and
 * Server Actions must obtain a client via this function.
 *
 * The client uses the PUBLISHABLE key so it respects RLS — use
 * `createAdminClient` (below) only for trusted server-side operations that
 * genuinely require bypassing RLS.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
