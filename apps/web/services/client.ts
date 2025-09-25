import type { SupabaseClientWithDatabase } from '@tkhwang-pico/supabase';
import { createWebClientWithAuth } from '@tkhwang-pico/supabase';

import { type AuthClerkSession } from '@/types/auth';

/**
 * Create a Supabase client with authentication required
 * Throws error if session is null/undefined
 */
export function createAuthenticatedSupabaseClient(
  session: AuthClerkSession,
): SupabaseClientWithDatabase {
  if (!session) {
    throw new Error('Authentication required');
  }

  return createWebClientWithAuth(session);
}
