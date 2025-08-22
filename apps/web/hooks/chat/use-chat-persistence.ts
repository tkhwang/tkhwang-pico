import { useCallback, useEffect, useState } from "react";
import { useCopilotMessagesContext } from "@copilotkit/react-core";
import {
  TextMessage,
  Role as copilotKitRole,
} from "@copilotkit/runtime-client-gql";
import { copilotRoleToString } from "@/utils/copilotkit";
import { isBrowser } from "@/utils/browser";
import { useAuth } from "@/providers/auth-provider";
import { convertToCopilotMessages } from "@/utils/copilotkit";
import {
  saveMessage,
  getThreadWithMessages,
  updateThreadTitle,
  generateThreadTitle,
  type Thread,
} from "../../lib/supabase/chat";

// Build a stable key for message de-duplication within a thread
const buildMessageKey = (threadId: string, messageId: string) =>
  `${threadId}-${messageId}`;

interface UseChatPersistenceOptions {
  threadId?: string;
  autoSave?: boolean;
}

interface UseChatPersistenceReturn {
  thread: Thread | null;
  isLoading: boolean;
  error: string | null;
}

export function useChatPersistence({
  threadId,
  autoSave = true,
}: UseChatPersistenceOptions = {}): UseChatPersistenceReturn {
  const { user } = useAuth();
  const { messages, setMessages } = useCopilotMessagesContext();

  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(
    new Set()
  );

  const loadThread = useCallback(
    async (threadId: string) => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Load thread with messages
        const result = await getThreadWithMessages(threadId);

        if (!result) {
          setError("Thread not found");
          return;
        }

        const { thread, messages: threadMessages } = result;

        const copilotMessages = convertToCopilotMessages(threadMessages);
        setMessages(copilotMessages);

        setThread(thread);

        // Mark all loaded messages as saved to prevent re-saving
        const messageKeys = threadMessages.map((msg) =>
          buildMessageKey(threadId, msg.id)
        );
        setSavedMessageIds(new Set(messageKeys));
      } catch (err) {
        console.error("Failed to load thread:", err);
        setError(err instanceof Error ? err.message : "Failed to load thread");
      } finally {
        setIsLoading(false);
      }
    },
    [user, setMessages]
  );

  const updateTitle = useCallback(
    async (title: string) => {
      if (!thread) return;

      try {
        const updatedThread = await updateThreadTitle(thread.id, title);
        setThread(updatedThread);
      } catch (err) {
        console.error("Failed to update title:", err);
        setError(err instanceof Error ? err.message : "Failed to update title");
      }
    },
    [thread]
  );

  useEffect(
    function onMountLoadThread() {
      if (threadId && user) {
        loadThread(threadId);
      }
    },
    [loadThread, threadId, user]
  );

  /*
   * Auto-save messages when they change
   */
  useEffect(
    function onMessagesAutoSave() {
      if (!autoSave || !user || !thread || messages.length === 0) return;

      const saveMessages = async () => {
        try {
          // Find all unsaved messages
          const unsavedMessages = messages.filter(
            (message): message is TextMessage => {
              if (!(message instanceof TextMessage)) return false;
              const messageKey = buildMessageKey(thread.id, message.id);
              return !savedMessageIds.has(messageKey);
            }
          );

          for (const message of unsavedMessages) {
            const role = copilotRoleToString(message.role);
            const messageKey = buildMessageKey(thread.id, message.id);

            // Consume skip flag: do not persist, but mark as saved to avoid future attempts
            let shouldSkip = false;
            try {
              if (isBrowser()) {
                const skipKey = `pico:skip-saves:${thread.id}`;
                const skipId = sessionStorage.getItem(skipKey);
                if (skipId && skipId === message.id) {
                  sessionStorage.removeItem(skipKey);
                  shouldSkip = true;
                }
              }
            } catch {}

            if (!shouldSkip) {
              await saveMessage({
                threadId: thread.id,
                role,
                content: message.content,
                metadata: { saved: true },
              });
            }

            setSavedMessageIds((prev) => {
              const next = new Set(prev);
              next.add(messageKey);
              return next;
            });
          }

          // Update thread title if needed (only for user messages)
          const userMessages = messages.filter(
            (m) => m instanceof TextMessage && m.role === copilotKitRole.User
          );
          if (userMessages.length === 1 && !thread.title) {
            const firstUserMessage = userMessages[0] as TextMessage;
            const title = generateThreadTitle(firstUserMessage.content);
            await updateTitle(title);
          }
        } catch (err) {
          console.error("Failed to auto-save messages:", err);
          setError(
            err instanceof Error ? err.message : "Failed to save messages"
          );
        }
      };

      // Debounce to avoid too frequent saves
      const timeoutId = setTimeout(saveMessages, 500);
      return () => clearTimeout(timeoutId);
    },
    [messages, thread, user, autoSave, savedMessageIds, updateTitle]
  );

  return {
    thread,
    isLoading,
    error,
  };
}
