import { createBrowserClient } from "@supabase/ssr";
import { useSession } from "@clerk/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/types_db";

export function createClient(): SupabaseClient<Database> {
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

  return createBrowserClient<Database>(url, key);
}

// Hook-based client for components that need Clerk authentication
export function useSupabaseClient(): SupabaseClient<Database> {
  const { session } = useSession();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;

  return createBrowserClient<Database>(url, key, {
    accessToken: async () => {
      const token = await session?.getToken();
      return token || null;
    },
  });
}
