import { useUser } from '@clerk/clerk-expo';
import type { SimilarContentRecommendation } from '@tkhwang-pico/common';

import { queryKey } from '@/hooks/keys/query-key';
import { useSupabaseQuery } from '@/hooks/queries/supabase/use-supabase-query';
import { getSimilarContents } from '@/lib/api/contents';

interface UseSimilarContentsOptions {
  limit?: number;
  enabled?: boolean;
}

export function useSimilarContents(contentId?: string, options?: UseSimilarContentsOptions) {
  const { user } = useUser();
  const { limit = 5, enabled = true } = options ?? {};

  return useSupabaseQuery<SimilarContentRecommendation[]>(
    contentId && user?.id
      ? queryKey.similarContents.byUserAndContent(user.id, contentId)
      : ['similar_contents', 'no-user'],
    async (clerkToken) => {
      if (!contentId) {
        return [];
      }

      return getSimilarContents(clerkToken, contentId, { limit });
    },
    {
      enabled: Boolean(user?.id && contentId && enabled),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );
}
