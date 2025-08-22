"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateThreadTitle, type Thread } from "@/lib/supabase/chat";
import { useAuth } from "@/providers/auth-provider";

interface UpdateThreadTitleParams {
  threadId: string;
  title: string;
}

export function useUpdateThreadTitleMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<Thread, Error, UpdateThreadTitleParams>({
    mutationFn: async ({ threadId, title }) => {
      return await updateThreadTitle(threadId, title);
    },
    onSuccess: (data, variables) => {
      // Update the specific thread in the threads list cache
      queryClient.setQueryData(
        ["threads"],
        (oldData: { id: string; title: string }[]) => {
          if (!oldData) return oldData;
          return oldData.map((thread) =>
            thread.id === variables.threadId
              ? { ...thread, title: data.title }
              : thread
          );
        }
      );

      // Update the specific thread data if it exists
      queryClient.setQueryData(
        ["threads", user?.id],
        (oldData: { id: string; title: string }[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((t) =>
            t.id === variables.threadId ? { ...t, title: data.title } : t
          );
        }
      );
    },
    onError: (error, variables) => {
      console.error(
        `Failed to update thread title for ${variables.threadId}:`,
        error
      );
    },
  });
}
