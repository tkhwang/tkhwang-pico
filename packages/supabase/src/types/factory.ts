import type { AuthConfig, SupabaseClientWithDatabase } from "../lib/config";
import type {
  MobileClientOptions,
  MobileSupabaseConfig,
} from "../clients/mobile";
import type {
  ServerSupabaseConfig,
  SupabaseClientFactory,
} from "../clients/server";
import type {
  ClerkSession,
  ServerCookieMethods,
  WebSupabaseConfig,
} from "../clients/web";

export type SupabasePlatform = "web" | "server" | "mobile";

export type SupabaseClientMode = "public" | "auth" | "service";

export type WebRuntime = "browser" | "server";

export type WebClientMode = "public" | "auth";

export interface BaseFactoryResult<
  P extends SupabasePlatform,
  M extends SupabaseClientMode,
> {
  platform: P;
  mode: M;
  client: SupabaseClientWithDatabase;
}

export interface WebFactoryHelpers {
  runtime: WebRuntime;
  getClerkToken: (getToken: () => Promise<string | null>) => Promise<string>;
}

export interface ServerFactoryHelpers {
  getClientFactory: () => SupabaseClientFactory;
  getClientForUser: (jwt: string) => SupabaseClientWithDatabase;
  getPublicClient: () => SupabaseClientWithDatabase;
  getServiceClient: () => SupabaseClientWithDatabase;
}

export interface MobileFactoryHelpers {
  createClientWithClerkToken: (
    clerkToken: string | null
  ) => SupabaseClientWithDatabase;
}

export interface WebFactoryResult
  extends BaseFactoryResult<"web", WebClientMode> {
  helpers: WebFactoryHelpers;
}

export interface ServerFactoryResult
  extends BaseFactoryResult<"server", "public" | "auth" | "service"> {
  helpers: ServerFactoryHelpers;
}

export interface MobileFactoryResult
  extends BaseFactoryResult<"mobile", "public" | "auth"> {
  helpers: MobileFactoryHelpers;
}

export type SupabaseFactoryResult =
  | WebFactoryResult
  | ServerFactoryResult
  | MobileFactoryResult;

export interface WebFactoryOptions {
  platform: "web";
  runtime?: WebRuntime;
  mode?: WebClientMode;
  session?: ClerkSession | null;
  cookies?: ServerCookieMethods;
  auth?: AuthConfig;
  config?: Partial<WebSupabaseConfig>;
}

export interface ServerFactoryOptions {
  platform: "server";
  mode?: "public" | "auth" | "service";
  auth?: AuthConfig;
  config?: Partial<ServerSupabaseConfig>;
}

export interface MobileFactoryOptions {
  platform: "mobile";
  mode?: "public" | "auth";
  auth?: AuthConfig;
  options?: MobileClientOptions;
  config?: Partial<MobileSupabaseConfig>;
}

export type SupabaseFactoryOptions =
  | WebFactoryOptions
  | ServerFactoryOptions
  | MobileFactoryOptions;
