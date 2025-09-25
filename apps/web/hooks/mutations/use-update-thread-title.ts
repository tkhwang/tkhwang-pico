import { useQueryClient } from '@tanstack/react-query';
import type { ThreadWithLastMessage } from '@tkhwang-pico/supabase';

import { queryKey } from '@/hooks/keys/query-key';
import { useSupabaseMutation } from '@/hooks/mutations/supabase/use-supabase-mutation';
import { useAuth } from '@/providers/auth-provider';
import { ThreadsRepository } from '@/services/repositories/threads.repository';

interface UpdateThreadTitleParams {
  threadId: string;
  title: string;
}

interface UpdateThreadTitleContext {
  previousThreads: ThreadWithLastMessage[] | undefined;
}

export function useUpdateThreadTitle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useSupabaseMutation<void, Error, UpdateThreadTitleParams, UpdateThreadTitleContext>(
    async (session, { threadId, title }) => {
      const threadsRepository = new ThreadsRepository(session);
      await threadsRepository.updateThreadTitle(threadId, title);
    },
    {
      onMutate: async ({ threadId, title }) => {
        if (!user?.id) {
          return { previousThreads: undefined };
        }
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: queryKey.threads.byUserId(user?.id),
        });

        // Snapshot the previous value
        const previousThreads = queryClient.getQueryData<ThreadWithLastMessage[]>(
          queryKey.threads.byUserId(user?.id),
        );

        // Optimistically update the thread title
        queryClient.setQueryData<ThreadWithLastMessage[]>(
          queryKey.threads.byUserId(user?.id),
          (old) =>
            old?.map((thread) => (thread.id === threadId ? { ...thread, title } : thread)) ?? [],
        );

        return { previousThreads };
      },
      onError: (_, __, context) => {
        // Rollback on error
        if (context?.previousThreads) {
          queryClient.setQueryData(queryKey.threads.byUserId(user?.id), context.previousThreads);
        }
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries({
          queryKey: queryKey.threads.byUserId(user?.id),
        });
      },
    },
  );
}
