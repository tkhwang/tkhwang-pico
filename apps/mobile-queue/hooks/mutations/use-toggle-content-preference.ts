import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Alert } from 'react-native';
import { togglePreference } from '@/lib/supabase/preferences';
import { queryKey } from '@/hooks/keys/query-key';
import type { PreferenceType } from '@tkhwang-pico/common';

interface ToggleContentPreferenceParams {
  contentId: string;
  preferenceType: PreferenceType;
  reason?: string;
}

type TogglePreferenceResult = Awaited<ReturnType<typeof togglePreference>>;

interface UseToggleContentPreferenceOptions {
  onSuccess?: (result: TogglePreferenceResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Toggle a content preference (liked, not_interested, blocked)
 * Automatically manages authentication and cache invalidation
 */
export function useToggleContentPreference(options?: UseToggleContentPreferenceOptions) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { user } = useUser();

  return useMutation<TogglePreferenceResult, Error, ToggleContentPreferenceParams>({
    mutationFn: async ({ contentId, preferenceType, reason }) => {
      const token = await getToken();
      if (!token) throw new Error('Authentication token not available');
      if (!user?.id) throw new Error('User not found');

      return togglePreference(token, user.id, contentId, preferenceType, reason);
    },

    onSuccess: (result) => {
      if (user?.id) {
        // Invalidate cached content lists and recommendations to reflect preference changes
        queryClient.invalidateQueries({
          queryKey: queryKey.userContents.byUserId(user.id),
          exact: false,
        });

        queryClient.invalidateQueries({
          queryKey: queryKey.recommendations.byUserId(user.id),
          exact: false,
        });
      }

      options?.onSuccess?.(result);
    },

    onError: (error) => {
      console.error('Failed to toggle content preference:', error);
      Alert.alert('오류', '선호도 설정 중 문제가 발생했습니다.', [{ text: '확인' }]);

      options?.onError?.(error);
    },
  });
}
