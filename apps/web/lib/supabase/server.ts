import { auth } from '@clerk/nextjs/server';
import { createSupabaseClientFactory, getClerkToken } from '@tkhwang-pico/supabase/clients';
import { cookies } from 'next/headers';

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { client } = createSupabaseClientFactory({
    platform: 'web',
    runtime: 'server',
    mode: 'public',
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });

  return client;
}

/**
 * Server client with Clerk authentication for protected operations
 * Use this for operations that require user authentication
 */
export async function createClientWithAuth() {
  const { getToken } = await auth();
  const cookieStore = await cookies();
  const token = await getClerkToken(() => getToken({ template: 'supabase' }));

  const { client } = createSupabaseClientFactory({
    platform: 'web',
    runtime: 'server',
    mode: 'auth',
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
    auth: {
      token,
    },
  });

  return client;
}
