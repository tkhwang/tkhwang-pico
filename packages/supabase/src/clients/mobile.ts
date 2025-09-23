import type { SupabaseClientOptions } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

import {
  type AuthConfig,
  type BaseSupabaseConfig,
  SupabaseAuthError,
  type SupabaseClientWithDatabase,
  validateAuthToken,
  validateBaseConfig,
} from '../lib/config';

/**
 * Mobile platform Supabase configuration from environment variables
 */
export interface MobileSupabaseConfig extends BaseSupabaseConfig {}

/**
 * AsyncStorage interface for React Native
 */
export interface AsyncStorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

/**
 * Mobile-specific Supabase client options
 */
export interface MobileClientOptions {
  /** Custom AsyncStorage implementation */
  storage?: AsyncStorageInterface;
  /** Whether to persist sessions */
  persistSession?: boolean;
  /** Whether to auto-refresh tokens */
  autoRefreshToken?: boolean;
  /** Whether to detect sessions in URLs */
  detectSessionInUrl?: boolean;
}

/**
 * Get Supabase configuration from Expo environment variables
 */
export function getMobileSupabaseConfig(): MobileSupabaseConfig {
  const config = {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  };

  return validateBaseConfig(config);
}

/**
 * Create authenticated Supabase client for React Native with Clerk JWT
 * Use this for all authenticated operations in mobile app
 */
export function createMobileClientWithAuth(
  authConfig: AuthConfig,
  options?: MobileClientOptions,
  config?: Partial<MobileSupabaseConfig>
): SupabaseClientWithDatabase {
  const token = validateAuthToken(authConfig.token);
  const supabaseConfig = config ? validateBaseConfig(config) : getMobileSupabaseConfig();

  const clientOptions: SupabaseClientOptions<'public'> = {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      storage: options?.storage,
      autoRefreshToken: options?.autoRefreshToken ?? false,
      persistSession: options?.persistSession ?? false,
      detectSessionInUrl: options?.detectSessionInUrl ?? false,
    },
  };

  return createClient(supabaseConfig.url, supabaseConfig.anonKey, clientOptions);
}

/**
 * Create unauthenticated Supabase client for React Native
 * Use this for public data that doesn't require authentication
 */
export function createMobileClient(
  options?: MobileClientOptions,
  config?: Partial<MobileSupabaseConfig>
): SupabaseClientWithDatabase {
  const supabaseConfig = config ? validateBaseConfig(config) : getMobileSupabaseConfig();

  const clientOptions: SupabaseClientOptions<'public'> = {
    auth: {
      storage: options?.storage,
      autoRefreshToken: options?.autoRefreshToken ?? true,
      persistSession: options?.persistSession ?? true,
      detectSessionInUrl: options?.detectSessionInUrl ?? false,
    },
  };

  return createClient(supabaseConfig.url, supabaseConfig.anonKey, clientOptions);
}

/**
 * Create Supabase client with Clerk token for React Native
 * This is a simplified version that matches the existing pattern
 * @deprecated Use createMobileClientWithAuth instead
 */
export function createSupabaseClientWithClerkAuth(
  clerkToken: string | null,
  options?: MobileClientOptions,
  config?: Partial<MobileSupabaseConfig>
): SupabaseClientWithDatabase {
  if (!clerkToken) {
    throw new SupabaseAuthError('Clerk token is required');
  }

  return createMobileClientWithAuth({ token: clerkToken }, options, config);
}
