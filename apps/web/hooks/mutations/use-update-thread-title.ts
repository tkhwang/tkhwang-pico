import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import {
  updateThreadTitle,
  type ThreadWithLastMessage,
} from "@/lib/supabase/chat";
import { queryKey } from "@/hooks/keys/query-key";

export function useUpdateThreadTitle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      title,
    }: {
      threadId: string;
      title: string;
    }) => {
      await updateThreadTitle(threadId, title);
    },
    onMutate: async ({ threadId, title }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKey.threads.byUserId(user?.id),
      });

      // Snapshot the previous value
      const previousThreads = queryClient.getQueryData<ThreadWithLastMessage[]>(
        queryKey.threads.byUserId(user?.id)
      );

      // Optimistically update the thread title
      queryClient.setQueryData<ThreadWithLastMessage[]>(
        queryKey.threads.byUserId(user?.id),
        (old) =>
          old?.map((thread) =>
            thread.id === threadId ? { ...thread, title } : thread
          ) ?? []
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
  });
}
