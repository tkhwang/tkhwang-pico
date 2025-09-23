import { createSupabaseClientFactory } from "@tkhwang-pico/supabase/clients";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { client: supabase } = createSupabaseClientFactory({
    platform: "web",
    runtime: "server",
    mode: "public",
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}
