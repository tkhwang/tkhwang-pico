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

export function buildMobileFactory(
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
        "Auth mode for mobile clients requires an auth token."
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

  throw new SupabaseConfigError(`Unsupported mobile mode: ${mode}`);
}
