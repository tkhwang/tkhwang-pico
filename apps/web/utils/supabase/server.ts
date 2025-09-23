import { cookies } from "next/headers";

import { createSupabaseClientFactory } from "@tkhwang-pico/supabase/clients";

export async function createClient() {
  const cookieStore = await cookies();

  const { client } = createSupabaseClientFactory({
    platform: "web",
    runtime: "server",
    mode: "public",
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        });
      },
    },
  });

  return client;
}
