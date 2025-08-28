"use client";

import { useQueryClient } from "@tanstack/react-query";
import { queryKey } from "@/hooks/keys/query-key";
import {
  saveMessage,
  type SaveMessageParams,
  type Message,
} from "@/lib/supabase/chat";
import { useSupabaseMutation } from "@/hooks/mutations/supabase/use-supabase-mutation";

export function useSaveMessage(providedThreadId?: string) {
  const queryClient = useQueryClient();

  // Allow callers to omit threadId when provided by hook param
  type SaveMessageVariables = Omit<SaveMessageParams, "threadId"> & {
    threadId?: string;
  };

  return useSupabaseMutation<Message, Error, SaveMessageVariables>(
    async (session, params) => {
      const threadId = params.threadId ?? providedThreadId;
      if (!threadId) {
        throw new Error("threadId is required");
      }

      return await saveMessage(session, { ...params, threadId });
    },
    {
      onSuccess: async (_data, variables) => {
        const threadId = variables.threadId ?? providedThreadId;
        if (threadId) {
          await queryClient.invalidateQueries({
            queryKey: queryKey.messages.byThreadId(threadId),
          });
        }
      },
    }
  );
}
