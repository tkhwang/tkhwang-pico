import { getMobileSupabaseConfig } from "./mobile";
import { buildServerFactory } from "./platform-resolvers/server.factory";
import { buildMobileFactory } from "./platform-resolvers/mobile.factory";
import { buildWebFactory } from "./platform-resolvers/web.factory";
import { getServerSupabaseConfig } from "./server";
import { getWebSupabaseConfig } from "./web";
import { SupabaseConfigError } from "../lib/config";
import type { SupabaseFactoryOptions, SupabaseFactoryResult } from "../types";

export function createSupabaseClientFactory(
  options: SupabaseFactoryOptions
): SupabaseFactoryResult {
  switch (options.platform) {
    case "web":
      return buildWebFactory(options);
    case "server":
      return buildServerFactory(options);
    case "mobile":
      return buildMobileFactory(options);
    default: {
      const exhaustiveCheck: never = options;
      throw new SupabaseConfigError(
        `Unsupported platform: ${exhaustiveCheck}`
      );
    }
  }
}

export function getSupabaseConfigForPlatform(
  platform: "web"
): ReturnType<typeof getWebSupabaseConfig>;
export function getSupabaseConfigForPlatform(
  platform: "server"
): ReturnType<typeof getServerSupabaseConfig>;
export function getSupabaseConfigForPlatform(
  platform: "mobile"
): ReturnType<typeof getMobileSupabaseConfig>;
export function getSupabaseConfigForPlatform(
  platform: "web" | "server" | "mobile"
) {
  switch (platform) {
    case "web":
      return getWebSupabaseConfig();
    case "server":
      return getServerSupabaseConfig();
    case "mobile":
      return getMobileSupabaseConfig();
    default: {
      const exhaustiveCheck: never = platform;
      throw new SupabaseConfigError(
        `Unsupported platform: ${exhaustiveCheck}`
      );
    }
  }
}
