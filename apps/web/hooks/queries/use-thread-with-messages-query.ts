"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getThreadWithMessages,
  type Message,
  type Thread,
} from "@/lib/supabase/chat";

export interface UseThreadWithMessagesResult {
  thread: Thread | null;
  messages: Message[];
}

export function useThreadWithMessagesQuery(threadId: string | undefined) {
  return useQuery<UseThreadWithMessagesResult>({
    queryKey: ["thread-with-messages", threadId],
    enabled: !!threadId,
    queryFn: async () => {
      if (!threadId) {
        return { thread: null, messages: [] };
      }
      const result = await getThreadWithMessages(threadId);
      if (!result) {
        return { thread: null, messages: [] };
      }
      return { thread: result.thread, messages: result.messages };
    },
    staleTime: 15_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
