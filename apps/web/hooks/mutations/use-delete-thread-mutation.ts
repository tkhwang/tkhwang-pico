"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteThread } from "@/lib/supabase/chat";

interface DeleteThreadParams {
  threadId: string;
  userId?: string;
}

export function useDeleteThreadMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteThreadParams>({
    mutationFn: async ({ threadId }) => {
      await deleteThread(threadId);
    },
    onSuccess: (_, variables) => {
      // Remove the thread from threads list cache
      queryClient.setQueryData(
        ["threads", variables.userId],
        (oldData: { id: string }[]) => {
          if (!oldData) return oldData;
          return oldData.filter((thread) => thread.id !== variables.threadId);
        }
      );

      // Remove the specific thread data from cache
      queryClient.removeQueries({
        queryKey: ["thread", variables.threadId],
      });

      // Also invalidate threads query to ensure consistency
      if (variables.userId) {
        queryClient.invalidateQueries({
          queryKey: ["threads", variables.userId],
        });
      }
    },
    onError: (error, variables) => {
      console.error(`Failed to delete thread ${variables.threadId}:`, error);
    },
  });
}
