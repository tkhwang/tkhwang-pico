"use client";

import { queryKey } from "@/hooks/keys/query-key";
import { useSupabaseQuery } from "@/hooks/queries/supabase/use-supabase-query";
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
  return useSupabaseQuery(
    queryKey.messages.byThreadId(threadId),
    async (session) => {
      if (!threadId) throw new Error("threadId is required");

      const result = await getThreadWithMessages(session, threadId);
      if (!result) throw new Error("Thread not found");
      return result;
    },
    {
      enabled: enabled ?? Boolean(threadId),
      // Use global defaults from QueryProvider; override if needed
      // staleTime: 60_000,
    }
  );
}
