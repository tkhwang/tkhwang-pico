import {
  createWebClientWithAuth,
  createWebServerClient,
  createWebServerClientWithAuth,
  getClerkToken,
} from "../web";
import type { ClerkSession, ServerCookieMethods } from "../web";
import {
  SupabaseAuthError,
  SupabaseConfigError,
  validateAuthToken,
} from "../../lib/config";
import type {
  WebFactoryOptions,
  WebFactoryResult,
  WebRuntime,
} from "../../types";

function resolveWebRuntime(runtime?: WebRuntime): WebRuntime {
  return runtime ?? "browser";
}

export function createWebFactoryResult(
  options: WebFactoryOptions
): WebFactoryResult {
  const runtime = resolveWebRuntime(options.runtime);
  const defaultMode = runtime === "browser" ? "auth" : "public";
  const mode = options.mode ?? defaultMode;

  if (runtime === "browser") {
    if (mode !== "auth") {
      throw new SupabaseConfigError(
        "브라우저 런타임에서는 auth 모드만 지원합니다."
      );
    }
    const session: ClerkSession | null = options.session ?? null;
    const client = createWebClientWithAuth(session, options.config);

    return {
      platform: "web",
      mode,
      client,
      helpers: {
        runtime,
        getClerkToken,
      },
    };
  }

  if (!options.cookies) {
    throw new SupabaseConfigError(
      "서버 런타임에서는 cookies 객체가 필요합니다."
    );
  }

  const cookies: ServerCookieMethods = options.cookies;

  if (mode === "auth") {
    if (!options.auth) {
      throw new SupabaseAuthError(
        "서버 auth 모드에서는 auth 토큰 구성이 필요합니다."
      );
    }

    const validatedAuth = {
      token: validateAuthToken(options.auth.token),
    };

    const client = createWebServerClientWithAuth(
      cookies,
      validatedAuth,
      options.config
    );

    return {
      platform: "web",
      mode,
      client,
      helpers: {
        runtime,
        getClerkToken,
      },
    };
  }

  if (mode !== "public") {
    throw new SupabaseConfigError(`지원되지 않는 web 모드입니다: ${mode}`);
  }

  const client = createWebServerClient(cookies, options.config);

  return {
    platform: "web",
    mode,
    client,
    helpers: {
      runtime,
      getClerkToken,
    },
  };
}
