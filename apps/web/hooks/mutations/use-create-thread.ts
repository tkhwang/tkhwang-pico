import { useQueryClient } from '@tanstack/react-query';
import type { CreateThreadParams, ThreadWithLastMessage } from '@tkhwang-pico/supabase';

import { queryKey } from '@/hooks/keys/query-key';
import { useSupabaseMutation } from '@/hooks/mutations/supabase/use-supabase-mutation';
import { useAuth } from '@/providers/auth-provider';
import { ThreadsRepository } from '@/services/repositories/threads.repository';

interface CreateThreadContext {
  previousThreads: ThreadWithLastMessage[] | undefined;
  optimisticThread: ThreadWithLastMessage;
}

export function useCreateThread() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useSupabaseMutation<
    ThreadWithLastMessage,
    Error,
    Omit<CreateThreadParams, 'userId'>,
    CreateThreadContext
  >(
    async (session, params: Omit<CreateThreadParams, 'userId'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const threadsRepository = new ThreadsRepository(session);
      return await threadsRepository.createThread({ ...params, userId: user.id });
    },
    {
      onMutate: async (params) => {
        if (!user?.id) {
          return {
            previousThreads: undefined,
            optimisticThread: {
              id: '',
              user_id: '',
              title: '',
              metadata: {},
              created_at: '',
              updated_at: '',
              messageCount: 0,
            },
          };
        }
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: queryKey.threads.byUserId(user?.id),
        });

        // Snapshot the previous value
        const previousThreads = queryClient.getQueryData<ThreadWithLastMessage[]>(
          queryKey.threads.byUserId(user?.id),
        );

        // Create optimistic thread
        const optimisticThread: ThreadWithLastMessage = {
          id: `temp-${Date.now()}`,
          user_id: user?.id || '',
          title: params.title || 'New Chat',
          metadata: params.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messageCount: 0,
        };

        // Optimistically add the new thread at the beginning
        queryClient.setQueryData<ThreadWithLastMessage[]>(
          queryKey.threads.byUserId(user?.id),
          (old) => [optimisticThread, ...(old || [])],
        );

        return { previousThreads, optimisticThread };
      },
      onSuccess: (newThread, _, context) => {
        // Replace optimistic thread with real thread
        queryClient.setQueryData<ThreadWithLastMessage[]>(
          queryKey.threads.byUserId(user?.id),
          (old) =>
            old?.map((thread) =>
              thread.id === context?.optimisticThread.id
                ? { ...newThread, messageCount: 0 }
                : thread,
            ) || [],
        );
      },
      onError: (_, __, context) => {
        // Rollback on error
        if (context?.previousThreads) {
          queryClient.setQueryData(queryKey.threads.byUserId(user?.id), context.previousThreads);
        }
      },
      onSettled: () => {
        // Always refetch to ensure consistency
        queryClient.invalidateQueries({
          queryKey: queryKey.threads.byUserId(user?.id),
        });
      },
    },
  );
}
