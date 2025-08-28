"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKey } from "@/hooks/keys/query-key";
import { useSupabaseClient } from "@/lib/supabase/client";
import {
  saveMessageWithAuth,
  type SaveMessageParams,
  type Message,
} from "@/lib/supabase/chat";

export function useSaveMessage(providedThreadId?: string) {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation<Message, Error, SaveMessageParams>({
    mutationFn: async (params) => {
      const threadId = params.threadId ?? providedThreadId;
      if (!threadId) {
        throw new Error("threadId is required");
      }

      const saveMessageFn = saveMessageWithAuth(supabase);
      return await saveMessageFn({ ...params, threadId });
    },
    onSuccess: async (_data, variables) => {
      const threadId = variables.threadId ?? providedThreadId;
      if (threadId) {
        await queryClient.invalidateQueries({
          queryKey: queryKey.messages.byThreadId(threadId),
        });
      }
    },
  });
}
