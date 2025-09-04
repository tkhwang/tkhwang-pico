import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { saveContent } from '@/lib/api/contents';
import { queryKey } from '@/hooks/keys/query-key';
import { Alert } from 'react-native';

interface UseSaveContentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSaveContent(options?: UseSaveContentOptions) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (url: string) => {
      const token = await getToken();
      if (!token) throw new Error('Authentication token not available');

      return saveContent(url, token);
    },
    onSuccess: () => {
      // Invalidate user contents query to refresh the list
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKey.userContents.byUserId(user.id),
        });
      }

      // Call custom onSuccess callback
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Failed to save content:', error);

      // Show error alert
      Alert.alert(
        'Failed to save content',
        error.message || 'Please check your connection and try again.',
        [{ text: 'OK' }]
      );

      // Call custom onError callback
      options?.onError?.(error);
    },
  });
}
