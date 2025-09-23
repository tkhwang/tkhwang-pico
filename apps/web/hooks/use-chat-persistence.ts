import {
  useCopilotChat,
  useCopilotMessagesContext,
} from "@copilotkit/react-core";
import { MessageRole, TextMessage } from "@copilotkit/runtime-client-gql";
import type { Thread } from "@tkhwang-pico/supabase";
import { useEffect, useRef, useState } from "react";

import { useSaveMessage } from "@/hooks/mutations/use-save-message";
import { useMessagesByThreadId } from "@/hooks/queries/use-message-by-thread-id";
import { useAuth } from "@/providers/auth-provider";
import { copilotRoleToString } from "@/utils/copilotkit";
import { convertToCopilotMessages } from "@/utils/copilotkit";

function hasSubstantiveContent(content: string): boolean {
  const trimmed = content.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.toUpperCase() === "EMPTY") return false;
  return true;
}

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
  const { visibleMessages, appendMessage } = useCopilotChat();
  const { setMessages } = useCopilotMessagesContext();

  const { mutateAsync: saveMessageMutate } = useSaveMessage(threadId);

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

      // Check if this is an initial message case (user message but no assistant response)
      const userMessages = threadMessages.filter((m) => m.role === "user");
      const assistantMessages = threadMessages.filter(
        (m) => m.role === "assistant",
      );
      const isInitialMessage =
        userMessages.length === 1 && assistantMessages.length === 0;

      if (isInitialMessage) {
        // For initial messages, send directly to copilot to trigger AI response
        const firstUserMessage = new TextMessage({
          role: MessageRole.User,
          content: userMessages[0].content,
        });
        appendMessage(firstUserMessage);
      } else {
        // Seed CopilotKit with DB messages for normal restoration
        setMessages(convertToCopilotMessages(threadMessages));
      }

      // Seed dedupe set with existing DB message ids
      const seeded = new Set<string>(threadMessages.map((m) => m.id));
      syncedIdsRef.current = seeded;
    },
    [data, setMessages, threadId, appendMessage],
  );

  useEffect(
    function reflectQueryError() {
      if (!queryError) return;
      setError(
        queryError instanceof Error ? queryError.message : String(queryError),
      );
    },
    [queryError],
  );

  //Save messages to DB when they change
  useEffect(
    function saveVisibleMessages() {
      if (!user || !thread || visibleMessages.length === 0) return;

      const run = async () => {
        try {
          const unsynced = visibleMessages.filter(
            (m): m is TextMessage =>
              m instanceof TextMessage &&
              hasSubstantiveContent(m.content) &&
              copilotRoleToString(m.role) === "assistant" &&
              !syncedIdsRef.current.has(m.id),
          );
          for (const m of unsynced) {
            await saveMessageMutate({
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
            err instanceof Error ? err.message : "Failed to save messages",
          );
        }
      };

      const id = setTimeout(run, 400);
      return () => clearTimeout(id);
    },
    [user, thread, visibleMessages, saveMessageMutate],
  );

  return {
    thread,
    isLoading: isQueryLoading,
    error,
  };
}
