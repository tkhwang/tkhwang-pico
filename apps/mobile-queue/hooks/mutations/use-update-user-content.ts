import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { Alert } from 'react-native';
import { queryKey } from '@/hooks/keys/query-key';
import { nestApi } from '@/lib/api/nest';

export function useUpdateUserContent() {
  const queryClient = useQueryClient();
  const { getToken, userId } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      todo_status,
      note,
    }: {
      id: string;
      todo_status?: 'pending' | 'completed';
      note?: string;
    }) => {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('Authentication token not available');

      return nestApi(`/users/contents/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({
          todo_status,
          note,
        }),
      });
    },

    onSuccess: (data, variables) => {
      if (userId) {
        // Invalidate both pending and completed lists
        queryClient.invalidateQueries({
          queryKey: queryKey.userContents.byUserId(userId),
        });

        // Show success message when moving back to pending
        if (variables.todo_status === 'pending') {
          Alert.alert('Success', 'Content moved back to your reading list');
        }
      }
    },

    onError: (error) => {
      console.error('Failed to update content:', error);
      Alert.alert('Error', 'Failed to update content');
    },
  });
}
