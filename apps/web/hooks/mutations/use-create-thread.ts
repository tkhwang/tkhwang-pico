import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { useSupabaseClient } from "@/lib/supabase/client";
import {
  createThread,
  type ThreadWithLastMessage,
  type CreateThreadParams,
} from "@/lib/supabase/chat";
import { queryKey } from "@/hooks/keys/query-key";

export function useCreateThread() {
  const { user } = useAuth();

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: Omit<CreateThreadParams, "userId">) => {
      if (!user?.id) throw new Error("User not authenticated");

      const createThreadFn = createThread(supabase);
      return await createThreadFn({ ...params, userId: user.id });
    },
    onMutate: async (params) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKey.threads.byUserId(user?.id),
      });

      // Snapshot the previous value
      const previousThreads = queryClient.getQueryData<ThreadWithLastMessage[]>(
        queryKey.threads.byUserId(user?.id)
      );

      // Create optimistic thread
      const optimisticThread: ThreadWithLastMessage = {
        id: `temp-${Date.now()}`,
        user_id: user?.id || "",
        title: params.title || "New Chat",
        metadata: params.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messageCount: 0,
      };

      // Optimistically add the new thread at the beginning
      queryClient.setQueryData<ThreadWithLastMessage[]>(
        queryKey.threads.byUserId(user?.id),
        (old) => [optimisticThread, ...(old || [])]
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
              : thread
          ) || []
      );
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
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKey.threads.byUserId(user?.id),
      });
    },
  });
}
