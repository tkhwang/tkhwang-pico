import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSupabaseClientFactory } from '@tkhwang-pico/supabase';

/**
 * Create an authenticated Supabase client with Clerk token
 * This follows the same pattern as the web app
 */
export function createSupabaseClientWithClerkAuth(clerkToken: string | null) {
  if (!clerkToken) {
    throw new Error('Authentication required');
  }

  const { client } = createSupabaseClientFactory({
    platform: 'mobile',
    mode: 'auth',
    auth: { token: clerkToken },
    options: {
      storage: AsyncStorage,
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}
