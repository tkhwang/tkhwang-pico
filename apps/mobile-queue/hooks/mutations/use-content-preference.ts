import { useAuth, useUser } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PreferenceType, Recommendation } from '@tkhwang-pico/common';
import { Alert } from 'react-native';

import { queryKey } from '@/hooks/keys/query-key';
import { setContentPreference } from '@/lib/supabase/preferences';

interface SetPreferenceParams {
  contentId: string;
  preferenceType: PreferenceType;
  reason?: string;
}

interface UseSetContentPreferenceOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for setting content preferences (liked, not_interested, blocked)
 * Handles optimistic updates and cache management
 */
export function useSetContentPreference(options?: UseSetContentPreferenceOptions) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { user } = useUser();

  interface MutationContext {
    previousRecommendations?: Recommendation[];
  }

  return useMutation<unknown, Error, SetPreferenceParams, MutationContext>({
    mutationFn: async ({ contentId, preferenceType, reason }) => {
      const token = await getToken();
      if (!token) throw new Error('Authentication token not available');
      if (!user?.id) throw new Error('User not found');

      return setContentPreference(token, user.id, contentId, preferenceType, reason);
    },

    onMutate: async ({ contentId, preferenceType }) => {
      // Only handle optimistic updates for not_interested and blocked
      // (these should remove from recommendations)
      if (preferenceType === 'not_interested' || preferenceType === 'blocked') {
        if (!user?.id) return {};

        const key = queryKey.recommendations.byUserId(user.id);
        await queryClient.cancelQueries({ queryKey: key });

        const previousRecommendations = queryClient.getQueryData<Recommendation[]>(key);

        // Optimistically remove from recommendations
        queryClient.setQueryData(key, (old: Recommendation[] | undefined) => {
          if (!old) return old;
          return old.filter((rec) => rec.content_id !== contentId);
        });

        return { previousRecommendations };
      }

      return {};
    },

    onError: (error: Error, _variables, context) => {
      console.error('Failed to set content preference:', error);

      // Rollback recommendations if we have previous data
      if (context?.previousRecommendations && user?.id) {
        const key = queryKey.recommendations.byUserId(user.id);
        queryClient.setQueryData(key, context.previousRecommendations);
      }

      Alert.alert('오류', '선호도 설정 중 문제가 발생했습니다.', [{ text: '확인' }]);

      options?.onError?.(error);
    },

    onSuccess: () => {
      // Could invalidate related queries if needed
      // For now, the optimistic update handles the UI change

      // Optional: Show success feedback
      options?.onSuccess?.();
    },
  });
}
