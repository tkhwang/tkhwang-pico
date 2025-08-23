"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKey } from "@/hooks/keys/query-key";
import {
  getThreadWithMessages,
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
  return useQuery<ThreadWithMessagesResult>({
    queryKey: queryKey.messages.byThreadId(threadId),
    queryFn: async () => {
      if (!threadId) throw new Error("threadId is required");
      const result = await getThreadWithMessages(threadId);
      if (!result) throw new Error("Thread not found");
      return result;
    },
    enabled: enabled ?? Boolean(threadId),
    // Use global defaults from QueryProvider; override if needed
    // staleTime: 60_000,
  });
}
