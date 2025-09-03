import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';

/**
 * Common hook for Supabase queries with automatic Clerk token management
 */
export function useSupabaseQuery<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: (clerkToken: string) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  const { getToken, isSignedIn } = useAuth();

  const { enabled, ...restOptions } = options ?? {};
  const isEnabled = (enabled ?? true) && isSignedIn;

  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        throw new Error('Failed to get authentication token');
      }
      return queryFn(token);
    },
    ...restOptions,
    enabled: isEnabled,
  });
}
