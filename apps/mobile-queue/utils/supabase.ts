import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@tkhwang-pico/common/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY');

// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: AsyncStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//   },
// });

/**
 * Create an authenticated Supabase client with Clerk token
 * This follows the same pattern as the web app
 */
export function createAuthenticatedSupabaseClient(clerkToken: string | null) {
  if (!clerkToken) {
    throw new Error('Authentication required');
  }

  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
