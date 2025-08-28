"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKey } from "@/hooks/keys/query-key";
import { useSupabaseClient } from "@/lib/supabase/client";
import {
  getThreadWithMessagesWithAuth,
  type Message,
  type Thread,
} from "@/lib/supabase/chat";

export interface ThreadWithMessagesResult {
  thread: Thread;
  messages: Message[];
}

export function useMessagesByThreadId(
  threadId: string | undefined,
  enabled?: boolean
) {
  const supabase = useSupabaseClient();

  return useQuery<ThreadWithMessagesResult>({
    queryKey: queryKey.messages.byThreadId(threadId),
    queryFn: async () => {
      if (!threadId) throw new Error("threadId is required");

      const getThreadWithMessagesFn = getThreadWithMessagesWithAuth(supabase);
      const result = await getThreadWithMessagesFn(threadId);
      if (!result) throw new Error("Thread not found");
      return result;
    },
    enabled: enabled ?? Boolean(threadId),
    // Use global defaults from QueryProvider; override if needed
    // staleTime: 60_000,
  });
}
