import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Enums, UserContentWithDetails } from '@tkhwang-pico/supabase';
import { Alert } from 'react-native';

import { createSupabaseClientWithClerkAuth } from '@/utils/supabase';

interface UpdateContentInput {
  userContentId: string;
  scheduledFor?: string | null;
  priority?: Enums<'content_priority'>;
}

interface UseUpdateContentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateContent(options?: UseUpdateContentOptions) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation<void, Error, UpdateContentInput>({
    mutationFn: async ({ userContentId, scheduledFor, priority }) => {
      const token = await getToken();
      if (!token) throw new Error('Authentication token not available');

      const client = createSupabaseClientWithClerkAuth(token);

      // Build update object with only provided fields
      const updates: Partial<UserContentWithDetails> = {};
      if (scheduledFor !== undefined) {
        updates.scheduled_for = scheduledFor;
      }
      if (priority !== undefined) {
        updates.priority = priority;
      }

      const { error } = await client.from('user_contents').update(updates).eq('id', userContentId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      // Invalidate all user content queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ['user_contents'],
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Failed to update content:', error);
      Alert.alert(
        'Failed to update',
        error.message || 'Please check your connection and try again.',
        [{ text: 'OK' }],
      );
      options?.onError?.(error);
    },
  });
}
