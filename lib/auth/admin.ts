import { createClient } from "@supabase/supabase-js";
import "server-only";

// Service role client — bypasses RLS. Only use server-side after verifying the
// user's identity via createServerClient().auth.getUser().
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
