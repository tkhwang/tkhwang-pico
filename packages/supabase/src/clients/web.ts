import type { CookieMethodsServer } from '@supabase/ssr';
import { createBrowserClient, createServerClient } from '@supabase/ssr';

import {
  type AuthConfig,
  type BaseSupabaseConfig,
  SupabaseAuthError,
  type SupabaseClientWithDatabase,
  validateAuthToken,
  validateBaseConfig,
} from '../lib/config';

/**
 * Web platform Supabase configuration from environment variables
 */
export interface WebSupabaseConfig extends BaseSupabaseConfig {}

/**
 * Clerk session interface for web authentication
 */
export interface ClerkSession {
  getToken(options?: { template?: string }): Promise<string | null>;
}

/**
 * Server-side cookie methods for SSR
 */
export interface ServerCookieMethods extends CookieMethodsServer {}

/**
 * Get Supabase configuration from Next.js environment variables
 */
export function getWebSupabaseConfig(): WebSupabaseConfig {
  const config = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
  };

  return validateBaseConfig(config);
}

/**
 * Create authenticated Supabase client for browser with Clerk session
 * Use this in client components and pages
 */
export function createWebClientWithAuth(
  session: ClerkSession | null,
  config?: Partial<WebSupabaseConfig>
): SupabaseClientWithDatabase {
  if (!session) {
    throw new SupabaseAuthError('Clerk session is required for authenticated client');
  }

  const supabaseConfig = config ? validateBaseConfig(config) : getWebSupabaseConfig();

  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey, {
    accessToken: async () => {
      try {
        const token = await session.getToken({ template: 'supabase' });
        return token || null;
      } catch (error) {
        console.error('Failed to get Clerk token:', error);
        throw new SupabaseAuthError(
          `Failed to get Clerk token: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    },
  });
}

/**
 * Create Supabase client for server-side rendering without authentication
 * Use this for public data or in middleware
 */
export function createWebServerClient(
  cookies: ServerCookieMethods,
  config?: Partial<WebSupabaseConfig>
): SupabaseClientWithDatabase {
  const supabaseConfig = config ? validateBaseConfig(config) : getWebSupabaseConfig();

  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies,
  });
}

/**
 * Create authenticated Supabase client for server-side with Clerk JWT
 * Use this in server actions, API routes, and server components that need user data
 */
export function createWebServerClientWithAuth(
  cookies: ServerCookieMethods,
  authConfig: AuthConfig,
  config?: Partial<WebSupabaseConfig>
): SupabaseClientWithDatabase {
  const token = validateAuthToken(authConfig.token);
  const supabaseConfig = config ? validateBaseConfig(config) : getWebSupabaseConfig();

  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies,
    accessToken: async () => token,
  });
}

/**
 * Utility to get Clerk token from auth function
 * Use this helper in server components and API routes
 */
export async function getClerkToken(getToken: () => Promise<string | null>): Promise<string> {
  try {
    const token = await getToken();
    return validateAuthToken(token);
  } catch (error) {
    throw new SupabaseAuthError(
      `Failed to get Clerk token: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
