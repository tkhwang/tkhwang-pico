import {
  createMobileClient,
  createMobileClientWithAuth,
  createSupabaseClientWithClerkAuth,
} from "../mobile";
import {
  SupabaseAuthError,
  SupabaseConfigError,
  validateAuthToken,
} from "../../lib/config";
import type { MobileFactoryOptions, MobileFactoryResult } from "../../types";

export function createMobileFactoryResult(
  options: MobileFactoryOptions
): MobileFactoryResult {
  const mode = options.mode ?? "public";
  const config = options.config;
  const mobileOptions = options.options;

  const helpers = {
    createClientWithClerkToken: (clerkToken: string | null) =>
      createSupabaseClientWithClerkAuth(clerkToken, mobileOptions, config),
  };

  if (mode === "auth") {
    if (!options.auth) {
      throw new SupabaseAuthError(
        "mobile auth 모드에는 auth 토큰이 필요합니다."
      );
    }

    const validatedAuth = {
      token: validateAuthToken(options.auth.token),
    };

    const client = createMobileClientWithAuth(
      validatedAuth,
      mobileOptions,
      config
    );

    return {
      platform: "mobile",
      mode,
      client,
      helpers,
    };
  }

  if (mode === "public") {
    const client = createMobileClient(mobileOptions, config);
    return {
      platform: "mobile",
      mode,
      client,
      helpers,
    };
  }

  throw new SupabaseConfigError(`지원되지 않는 mobile 모드입니다: ${mode}`);
}
