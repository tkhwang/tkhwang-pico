import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SupabaseFactoryOptions } from "@tkhwang-pico/supabase";
import { createSupabaseClientFactory } from "@tkhwang-pico/supabase/clients";

import { type AuthClerkSession } from "@/types/auth";

/**
 * Create a Supabase client with authentication required
 * Throws error if session is null/undefined
 */
export function createAuthenticatedSupabaseClient(
  session: AuthClerkSession,
): SupabaseClient<Database> {
  if (!session) {
    throw new Error("Authentication required");
  }

  const options: SupabaseFactoryOptions = {
    platform: "web",
    runtime: "browser",
    mode: "auth",
    session,
  };

  const { client } = createSupabaseClientFactory(options);

  return client;
}
