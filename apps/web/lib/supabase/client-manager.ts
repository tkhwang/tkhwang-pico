import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/types_db";
import type { AuthClerkSession } from "../../types/auth";

// WeakMap for caching clients by session to avoid recreation
const clientCache = new WeakMap<
  NonNullable<AuthClerkSession>,
  SupabaseClient<Database>
>();

/**
 * Get or create a Supabase client for the given session
 * Uses WeakMap caching to ensure the same session gets the same client instance
 */
export function getSupabaseClient(
  session: AuthClerkSession
): SupabaseClient<Database> {
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

  // Handle null session case
  if (!session) {
    return createBrowserClient<Database>(url, key);
  }

  // Check cache first
  if (clientCache.has(session)) {
    return clientCache.get(session)!;
  }

  // Create new client with auth
  const client = createBrowserClient<Database>(url, key, {
    accessToken: async () =>
      (await session.getToken({ template: "supabase" })) ?? null,
  });

  // Cache the client
  clientCache.set(session, client);
  return client;
}
