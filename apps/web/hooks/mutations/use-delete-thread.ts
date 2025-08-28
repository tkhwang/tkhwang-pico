import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { useSupabaseClient } from "@/lib/supabase/client";
import {
  deleteThreadWithAuth,
  type ThreadWithLastMessage,
} from "@/lib/supabase/chat";
import { queryKey } from "@/hooks/keys/query-key";

export function useDeleteThread() {
  const { user } = useAuth();

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      const deleteThreadFn = deleteThreadWithAuth(supabase);
      await deleteThreadFn(threadId);
    },
    onMutate: async (threadId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKey.threads.byUserId(user?.id),
      });

      // Snapshot the previous value
      const previousThreads = queryClient.getQueryData<ThreadWithLastMessage[]>(
        queryKey.threads.byUserId(user?.id)
      );

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
  });
}
