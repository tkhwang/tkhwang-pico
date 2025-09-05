import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { toggleTodoStatus } from '@/lib/supabase/todo';
import { queryKey } from '@/hooks/keys/query-key';
import { Alert } from 'react-native';

export function useToggleTodo() {
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userContentId: string) => {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No auth token');

      return toggleTodoStatus(token, userContentId);
    },
    onSuccess: () => {
      // Invalidate all user content queries to refresh the list
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: queryKey.userContents.byUserId(userId),
        });
      }
    },
    onError: (error) => {
      console.error('Toggle todo error:', error);
      Alert.alert('Error', 'Failed to update status');
    },
  });
}
