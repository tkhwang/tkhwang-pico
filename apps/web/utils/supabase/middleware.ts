import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseClientFactory } from "@tkhwang-pico/supabase/clients";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
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
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
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
