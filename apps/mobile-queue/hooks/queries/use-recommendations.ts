import { useUser } from '@clerk/clerk-expo';
import type { Recommendation } from '@tkhwang-pico/common';

import { queryKey } from '@/hooks/keys/query-key';
import { useSupabaseQuery } from '@/hooks/queries/supabase/use-supabase-query';
import { getRecommendations } from '@/lib/api/recommendations';

interface UseRecommendationsOptions {
  limit?: number;
  lang?: string;
}

export function useRecommendations(options?: UseRecommendationsOptions) {
  const { user } = useUser();
  const { limit = 20, lang } = options || {};

  return useSupabaseQuery(
    user?.id ? queryKey.recommendations.byUserId(user.id) : ['no-user'],
    async (clerkToken): Promise<Recommendation[]> => {
      if (!user?.id) return [];

      return await getRecommendations(clerkToken, { limit, lang });
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
