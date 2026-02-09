import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

/**
 * Admin client — uses service_role key.
 * Has full access, bypasses RLS. Use only in trusted server code.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Create a per-request Supabase client scoped to a user's JWT.
 * This respects RLS policies if you have them set up.
 */
export function createSupabaseClient(accessToken: string) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
