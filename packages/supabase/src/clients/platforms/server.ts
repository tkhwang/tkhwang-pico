import {
  createServerClient,
  createServerClientWithAuth,
  createServerServiceClient,
  SupabaseClientFactory,
} from "../server";
import {
  SupabaseAuthError,
  SupabaseConfigError,
  validateAuthToken,
} from "../../lib/config";
import type { ServerFactoryOptions, ServerFactoryResult } from "../../types";

export function createServerFactoryResult(
  options: ServerFactoryOptions
): ServerFactoryResult {
  const mode = options.mode ?? "service";
  const config = options.config;

  const helpersFactory = () => new SupabaseClientFactory(config);

  const helpers = {
    getClientFactory: helpersFactory,
    getClientForUser: (jwt: string) =>
      createServerClientWithAuth({ token: jwt }, config),
    getPublicClient: () => createServerClient(config),
    getServiceClient: () => createServerServiceClient(config),
  };

  if (mode === "service") {
    const client = createServerServiceClient(config);
    return {
      platform: "server",
      mode,
      client,
      helpers,
    };
  }

  if (mode === "auth") {
    if (!options.auth) {
      throw new SupabaseAuthError(
        "server auth 모드에는 auth 토큰이 필요합니다."
      );
    }

    const validatedAuth = {
      token: validateAuthToken(options.auth.token),
    };

    const client = createServerClientWithAuth(validatedAuth, config);

    return {
      platform: "server",
      mode,
      client,
      helpers,
    };
  }

  if (mode === "public") {
    const client = createServerClient(config);
    return {
      platform: "server",
      mode,
      client,
      helpers,
    };
  }

  throw new SupabaseConfigError(`지원되지 않는 server 모드입니다: ${mode}`);
}
