// Export base types and utilities
export * from "../lib/config";

// Export platform-specific factories
export * from "./web";
export * from "./mobile";
export * from "./server";
export * from "./client-factory";

// Re-export commonly used types from @supabase/supabase-js
export type {
  SupabaseClient,
  SupabaseClientOptions,
  User,
  Session,
  AuthError,
  PostgrestError,
} from "@supabase/supabase-js";

// Re-export SSR types for web platform
export type { CookieMethodsServer } from "@supabase/ssr";
