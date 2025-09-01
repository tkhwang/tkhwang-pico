// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// supabase/functions/clerk-user-sync/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "npm:svix@1.14.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // 절대 클라이언트에 노출 금지
const CLERK_WEBHOOK_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET")!; // Clerk Webhook Signing Secret(Svix)

const wh = new Webhook(CLERK_WEBHOOK_SECRET);

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

serve(async (req) => {
  // CORS (Clerk 대시보드 프리플라이트 대비)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "*",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method Not Allowed" }, 405);
  }

  // Svix 헤더 검증
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return json({ error: "Missing svix headers" }, 400);
  }

  const payload = await req.text();
  let evt: any;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (e) {
    console.error("Svix verify failed", e);
    return json({ error: "Invalid signature" }, 400);
  }

  const type: string = evt.type; // e.g. "user.created", "user.updated", "user.deleted"
  const user = evt.data;

  // Clerk user ID 추출
  const user_id = user.id; // "user_abc123"
  const email = user.email_addresses?.[0]?.email_address ?? null;
  const full_name =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username ||
    null;
  const avatar_url = user.image_url ?? null;

  // Supabase 클라이언트 생성
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  if (type === "user.deleted") {
    // 사용자 삭제 시 프로필도 삭제
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", user_id);

    if (error) {
      console.error("Supabase delete error:", error);
      return json({ error: error.message }, 500);
    }

    console.log(`User deleted: ${user_id}`);
    return json({ status: "deleted", user_id });
  }

  // 생성/업데이트 공통 처리 (upsert)
  const { error } = await supabase.from("profiles").upsert({
    user_id,
    email,
    full_name,
    avatar_url,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Supabase upsert error:", error);
    return json({ error: error.message }, 500);
  }

  console.log(`User ${type} processed successfully:`, user_id);
  return json({ status: "success", type, user_id });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/clerk-user-sync' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
