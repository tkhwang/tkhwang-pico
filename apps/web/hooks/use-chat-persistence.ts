import { useEffect, useRef, useState } from "react";
import {
  useCopilotChat,
  useCopilotMessagesContext,
} from "@copilotkit/react-core";
import { TextMessage } from "@copilotkit/runtime-client-gql";
import { copilotRoleToString } from "@/utils/copilotkit";
import { useAuth } from "@/providers/auth-provider";
import { convertToCopilotMessages } from "@/utils/copilotkit";
import { useMessagesByThreadId } from "@/hooks/queries/use-message-by-thread-id";
import { saveMessage, type Thread } from "../lib/supabase/chat";

// Minimal de-duplication by CopilotKit message id

interface UseChatPersistenceOptions {
  threadId?: string;
}

interface UseChatPersistenceReturn {
  thread: Thread | null;
  isLoading: boolean;
  error: string | null;
}

export function useChatPersistence({
  threadId,
}: UseChatPersistenceOptions = {}): UseChatPersistenceReturn {
  const { user } = useAuth();
  const { visibleMessages } = useCopilotChat();
  const { setMessages } = useCopilotMessagesContext();

  const [thread, setThread] = useState<Thread | null>(null);
  const [error, setError] = useState<string | null>(null);
  const syncedIdsRef = useRef<Set<string>>(new Set());

  const {
    data,
    isLoading: isQueryLoading,
    error: queryError,
  } = useMessagesByThreadId(threadId, Boolean(user && threadId));

  // Sync query data into CopilotKit context and local state
  useEffect(
    function restoreFromDbOnMount() {
      if (!data || !threadId) return;
      const { thread: loadedThread, messages: threadMessages } = data;
      setThread(loadedThread);
      // Seed CopilotKit with DB messages
      setMessages(convertToCopilotMessages(threadMessages));
      // Seed dedupe set with existing DB message ids
      const seeded = new Set<string>(threadMessages.map((m) => m.id));
      syncedIdsRef.current = seeded;
    },
    [data, setMessages, threadId]
  );

  // Reflect query error into local error state
  useEffect(
    function reflectQueryError() {
      if (!queryError) return;
      setError(
        queryError instanceof Error ? queryError.message : String(queryError)
      );
    },
    [queryError]
  );

  // Minimal version: no title auto-generation/update logic

  /*
   * Auto-save messages when they change
   */
  useEffect(
    function saveVisibleMessages() {
      if (!user || !thread || visibleMessages.length === 0) return;

      const run = async () => {
        try {
          const unsynced = visibleMessages.filter(
            (m): m is TextMessage =>
              m instanceof TextMessage && !syncedIdsRef.current.has(m.id)
          );
          for (const m of unsynced) {
            await saveMessage({
              threadId: thread.id,
              role: copilotRoleToString(m.role),
              content: m.content,
              metadata: { saved: true },
            });
            syncedIdsRef.current.add(m.id);
          }
        } catch (err) {
          console.error("Failed to auto-save messages:", err);
          setError(
            err instanceof Error ? err.message : "Failed to save messages"
          );
        }
      };

      const id = setTimeout(run, 400);
      return () => clearTimeout(id);
    },
    [user, thread, visibleMessages]
  );

  return {
    thread,
    isLoading: isQueryLoading,
    error,
  };
}
