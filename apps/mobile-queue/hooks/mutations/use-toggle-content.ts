import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKey } from '@/hooks/keys/query-key';
import { toggleTodoStatus } from '@/lib/supabase/todo';

/**
 * Hook for toggling content status between pending and completed
 * Uses direct Supabase call for better performance
 */
export function useToggleContent() {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async (userContentId: string) => {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('Authentication token not available');

      return toggleTodoStatus(token, userContentId);
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
      console.error('Failed to toggle content status:', error);
    },
  });
}
