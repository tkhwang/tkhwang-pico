import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { nestApi } from '@/lib/api/nest';
import { queryKey } from '@/hooks/keys/query-key';
import { Alert } from 'react-native';

export function useDeleteContent() {
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No auth token');

      return nestApi(`/users/contents/${contentId}`, {
        method: 'DELETE',
        token,
      });
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
      console.error('Delete content error:', error);
      Alert.alert('Error', 'Failed to delete content');
    },
  });
}
