import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKey } from '@/hooks/keys/query-key';
import { UserContentsRepository } from '@/services/repositories';

export function useToggleUserContentStatus() {
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userContentId: string) => {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('Authentication token not available');

      const repository = new UserContentsRepository(token);
      return repository.toggleTodoStatus(userContentId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: queryKey.userContents.byUserId(userId),
        });
      }
    },
    onError: (error) => {
      console.error('Failed to toggle user content status:', error);
    },
  });
}
