import { AuthClerkSession } from "@/types/auth";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@tkhwang-pico/common/supabase";

/**
 * Create a Supabase client with authentication required
 * Throws error if session is null/undefined
 */
export function createAuthenticatedSupabaseClient(
  session: AuthClerkSession
): SupabaseClient<Database> {
  if (!session) {
    throw new Error("Authentication required");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY environment variable"
    );
  }

  // Create client with authentication
  return createBrowserClient<Database>(url, key, {
    accessToken: async () =>
      (await session.getToken({ template: "supabase" })) ?? null,
  });
}
