import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { queryKey } from '@/hooks/keys/query-key';
import { markAsPending } from '@/lib/supabase/todo';

/**
 * Hook for reopening completed content (moving back to reading list)
 * Uses direct Supabase call for better performance
 */
export function useReopenContent() {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (userContentId: string) => {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('Authentication token not available');

      return markAsPending(token, userContentId);
    },

    onSuccess: () => {
      if (userId) {
        // Invalidate both pending and completed lists
        queryClient.invalidateQueries({
          queryKey: queryKey.userContents.byUserId(userId),
        });

        // No alert needed - the UI update is feedback enough
      }
    },

    onError: (error) => {
      console.error('Failed to reopen content:', error);
      Alert.alert('Error', 'Failed to move content to reading list');
    },
  });
}
