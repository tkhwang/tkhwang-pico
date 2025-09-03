import { useUser } from '@clerk/clerk-expo';
import { getUserContents } from '@/lib/supabase/contents';
import type { UserContentWithDetails } from '@tkhwang-pico/common';
import { queryKey } from '@/hooks/keys/query-key';
import { useSupabaseQuery } from '@/hooks/queries/supabase/use-supabase-query';

export function useUserContents() {
  const { user } = useUser();

  return useSupabaseQuery(
    user?.id ? queryKey.userContents.byUserId(user.id) : ['no-user'],
    async (clerkToken): Promise<UserContentWithDetails[]> => {
      if (!user?.id) return [];
      return await getUserContents(clerkToken, user.id);
    },
    {
      enabled: !!user?.id,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );
}
