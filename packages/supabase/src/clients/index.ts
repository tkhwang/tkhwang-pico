// Export base types and utilities
export * from '../lib/config';

// Export platform-specific factories
export * from './client-factory';
export * from './mobile';
export * from './server';
export * from './web';

// Re-export commonly used types from @supabase/supabase-js
export type {
  AuthError,
  PostgrestError,
  Session,
  SupabaseClient,
  SupabaseClientOptions,
  User,
} from '@supabase/supabase-js';

// Re-export SSR types for web platform
export type { CookieMethodsServer } from '@supabase/ssr';
