import type { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../types/supabase-database.types";

/**
 * Base Supabase client type with database schema
 */
export type SupabaseClientWithDatabase = ReturnType<
  typeof createBrowserClient<Database>
>;

/**
 * Common configuration for all Supabase clients
 */
export interface BaseSupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Authentication configuration for user-authenticated clients
 */
export interface AuthConfig {
  /** User JWT token or session */
  token: string | null;
}

/**
 * Server-side configuration for service role operations
 */
export interface ServerConfig extends BaseSupabaseConfig {
  serviceRoleKey: string;
}

/**
 * Environment variable validation errors
 */
export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(`Supabase Configuration Error: ${message}`);
    this.name = "SupabaseConfigError";
  }
}

/**
 * Authentication errors
 */
export class SupabaseAuthError extends Error {
  constructor(message: string) {
    super(`Supabase Authentication Error: ${message}`);
    this.name = "SupabaseAuthError";
  }
}

/**
 * Validates base Supabase configuration
 */
export function validateBaseConfig(
  config: Partial<BaseSupabaseConfig>
): BaseSupabaseConfig {
  if (!config.url) {
    throw new SupabaseConfigError("Missing Supabase URL");
  }
  if (!config.anonKey) {
    throw new SupabaseConfigError("Missing Supabase anonymous key");
  }
  return config as BaseSupabaseConfig;
}

/**
 * Validates authentication token
 */
export function validateAuthToken(token: string | null | undefined): string {
  if (!token) {
    throw new SupabaseAuthError("Authentication token is required");
  }
  return token;
}

/**
 * Validates server configuration
 */
export function validateServerConfig(
  config: Partial<ServerConfig>
): ServerConfig {
  const baseConfig = validateBaseConfig(config);
  if (!config.serviceRoleKey) {
    throw new SupabaseConfigError("Missing Supabase service role key");
  }
  return {
    ...baseConfig,
    serviceRoleKey: config.serviceRoleKey,
  };
}
