import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { deleteThread, type ThreadWithLastMessage } from "@/lib/supabase/chat";
import { queryKey } from "@/hooks/keys/query-key";
import { useSupabaseMutation } from "@/hooks/mutations/supabase/use-supabase-mutation";

interface DeleteThreadContext {
  previousThreads: ThreadWithLastMessage[] | undefined;
}

export function useDeleteThread() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useSupabaseMutation<void, Error, string, DeleteThreadContext>(
    async (session, threadId) => {
      await deleteThread(session, threadId);
    },
    {
      onMutate: async (threadId) => {
        if (!user?.id) {
          return { previousThreads: undefined };
        }
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: queryKey.threads.byUserId(user?.id),
        });

        // Snapshot the previous value
        const previousThreads = queryClient.getQueryData<
          ThreadWithLastMessage[]
        >(queryKey.threads.byUserId(user?.id));

        // Optimistically update by removing the thread
        queryClient.setQueryData<ThreadWithLastMessage[]>(
          queryKey.threads.byUserId(user?.id),
          (old) => old?.filter((thread) => thread.id !== threadId) ?? []
        );

        return { previousThreads };
      },
      onError: (_, __, context) => {
        // Rollback on error
        if (context?.previousThreads) {
          queryClient.setQueryData(
            queryKey.threads.byUserId(user?.id),
            context.previousThreads
          );
        }
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries({
          queryKey: queryKey.threads.byUserId(user?.id),
        });
      },
    }
  );
}
