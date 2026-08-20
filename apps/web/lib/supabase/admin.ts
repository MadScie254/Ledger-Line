import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client.
 * 
 * Uses the service_role key to bypass RLS. Only use this for trusted
 * server-side operations (like updating user app_metadata during onboarding).
 * NEVER expose this client to the browser.
 */
export const adminAuthClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
