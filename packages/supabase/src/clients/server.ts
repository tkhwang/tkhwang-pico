import type { SupabaseClientOptions } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

import {
  type AuthConfig,
  type SupabaseClientWithDatabase,
  SupabaseConfigError,
  validateAuthToken,
} from '../lib/config';

/**
 * Server platform Supabase configuration from environment variables
 */
export interface ServerSupabaseConfig {
  url: string;
  serviceRoleKey: string;
  /** Optional anonymous key for user-scoped clients */
  anonKey?: string;
}

/**
 * Validates server Supabase configuration
 */
function validateServerSupabaseConfig(config: Partial<ServerSupabaseConfig>): ServerSupabaseConfig {
  if (!config.url) {
    throw new SupabaseConfigError('Missing Supabase URL');
  }
  if (!config.serviceRoleKey) {
    throw new SupabaseConfigError('Missing Supabase service role key');
  }
  return config as ServerSupabaseConfig;
}

/**
 * Get Supabase configuration from Node.js environment variables
 */
export function getServerSupabaseConfig(): ServerSupabaseConfig {
  const config = {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  return validateServerSupabaseConfig(config);
}

/**
 * Create Supabase service client with administrative privileges
 * Use this for operations that bypass RLS or need elevated permissions
 * Warning: This client bypasses Row Level Security policies
 */
export function createServerServiceClient(
  config?: Partial<ServerSupabaseConfig>
): SupabaseClientWithDatabase {
  const supabaseConfig = config ? validateServerSupabaseConfig(config) : getServerSupabaseConfig();

  const clientOptions: SupabaseClientOptions<'public'> = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  };

  return createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, clientOptions);
}

/**
 * Create user-scoped Supabase client that enforces RLS
 * Use this for operations that should respect user permissions
 * Requires SUPABASE_ANON_KEY to be set in environment
 */
export function createServerClientWithAuth(
  authConfig: AuthConfig,
  config?: Partial<ServerSupabaseConfig>
): SupabaseClientWithDatabase {
  const token = validateAuthToken(authConfig.token);
  const supabaseConfig = config ? validateServerSupabaseConfig(config) : getServerSupabaseConfig();

  if (!supabaseConfig.anonKey) {
    throw new SupabaseConfigError('SUPABASE_ANON_KEY is required to create user-scoped clients');
  }

  const clientOptions: SupabaseClientOptions<'public'> = {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  };

  return createClient(supabaseConfig.url, supabaseConfig.anonKey, clientOptions);
}

/**
 * Create Supabase client for server-side operations without authentication
 * Use this for public data that doesn't require user authentication
 * Requires SUPABASE_ANON_KEY to be set in environment
 */
export function createServerClient(
  config?: Partial<ServerSupabaseConfig>
): SupabaseClientWithDatabase {
  const supabaseConfig = config ? validateServerSupabaseConfig(config) : getServerSupabaseConfig();

  if (!supabaseConfig.anonKey) {
    throw new SupabaseConfigError('SUPABASE_ANON_KEY is required to create public client');
  }

  const clientOptions: SupabaseClientOptions<'public'> = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  };

  return createClient(supabaseConfig.url, supabaseConfig.anonKey, clientOptions);
}

/**
 * Nest.js compatible service class for dependency injection
 * This provides the same interface as the existing SupabaseService
 */
export class SupabaseClientFactory {
  private readonly config: ServerSupabaseConfig;
  public readonly serviceClient: SupabaseClientWithDatabase;

  constructor(config?: Partial<ServerSupabaseConfig>) {
    this.config = config ? validateServerSupabaseConfig(config) : getServerSupabaseConfig();
    this.serviceClient = createServerServiceClient(this.config);
  }

  /**
   * Create a user-scoped client that enforces RLS by forwarding the user's JWT
   */
  getClientForUser(jwt: string): SupabaseClientWithDatabase {
    return createServerClientWithAuth({ token: jwt }, this.config);
  }

  /**
   * Get the service client with administrative privileges
   */
  getServiceClient(): SupabaseClientWithDatabase {
    return this.serviceClient;
  }

  /**
   * Create a public client without authentication
   */
  getPublicClient(): SupabaseClientWithDatabase {
    return createServerClient(this.config);
  }
}
