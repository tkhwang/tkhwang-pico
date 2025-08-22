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
  createThread,
  generateThreadTitle,
  type Thread,
} from "../../lib/supabase/chat";
import { useThreadWithMessagesQuery } from "@/hooks/queries/use-thread-with-messages-query";
import { useSaveMessageMutation } from "@/hooks/mutations/use-save-message-mutation";
import { useUpdateThreadTitleMutation } from "@/hooks/mutations/use-update-thread-title-mutation";

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
  saveCurrentThread: () => Promise<Thread | null>;
  loadThread: (threadId: string) => Promise<void>;
  updateTitle: (title: string) => Promise<void>;
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

  const {
    data: queryData,
    isPending: isQueryPending,
    error: queryError,
  } = useThreadWithMessagesQuery(threadId);

  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(
    new Set()
  );
  const [savingMessageIds, setSavingMessageIds] = useState<Set<string>>(
    new Set()
  );

  const saveMessageMutation = useSaveMessageMutation();
  const updateTitleMutation = useUpdateThreadTitleMutation();

  const loadThread = useCallback(
    async (threadId: string) => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Use cached query result for the provided threadId
        const result = queryData;
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
    [user, setMessages, queryData]
  );

  const saveCurrentThread = useCallback(async (): Promise<Thread | null> => {
    if (!user || messages.length === 0) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Create new thread if none exists
      let currentThread = thread;
      if (!currentThread) {
        const firstUserMessage = messages.find(
          (m) => m instanceof TextMessage && m.role === copilotKitRole.User
        ) as TextMessage | undefined;

        const title = firstUserMessage
          ? generateThreadTitle(firstUserMessage.content)
          : "New Chat";

        currentThread = await createThread({
          userId: user.id,
          title,
        });
        setThread(currentThread);
      }

      // Save all unsaved messages
      for (const message of messages) {
        if (!(message instanceof TextMessage)) continue;

        const messageKey = buildMessageKey(currentThread.id, message.id);
        if (savedMessageIds.has(messageKey)) continue;

        const role = copilotRoleToString(message.role);

        await saveMessageMutation.mutateAsync({
          threadId: currentThread.id,
          role,
          content: message.content,
          metadata: { saved: true },
        });

        // Mark as saved (after success)
        setSavedMessageIds((prev) => {
          const next = new Set(prev);
          next.add(messageKey);
          return next;
        });
      }

      return currentThread;
    } catch (err) {
      console.error("Failed to save thread:", err);
      setError(err instanceof Error ? err.message : "Failed to save thread");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, messages, thread, savedMessageIds, saveMessageMutation]);

  const updateTitle = useCallback(
    async (title: string) => {
      if (!thread) return;

      try {
        const updatedThread = await updateTitleMutation.mutateAsync({
          threadId: thread.id,
          title,
        });
        setThread(updatedThread);
      } catch (err) {
        console.error("Failed to update title:", err);
        setError(err instanceof Error ? err.message : "Failed to update title");
      }
    },
    [thread, updateTitleMutation]
  );

  useEffect(
    function onMountLoadThread() {
      if (!threadId || !user) return;

      // Reflect query loading state
      setIsLoading(isQueryPending);

      if (queryError) {
        setError(
          queryError instanceof Error
            ? queryError.message
            : "Failed to load thread"
        );
        return;
      }

      if (queryData) {
        void loadThread(threadId);
      }
    },
    [loadThread, threadId, user, isQueryPending, queryError, queryData]
  );

  // Auto-save messages when they change
  useEffect(
    function onMessagesAutoSave() {
      if (!autoSave || !user || !thread || messages.length === 0) return;

      const saveMessages = async () => {
        try {
          // Find all unsaved messages (not saved and not currently saving)
          const unsavedMessages = messages.filter(
            (message): message is TextMessage => {
              if (!(message instanceof TextMessage)) return false;
              const messageKey = buildMessageKey(thread.id, message.id);
              return (
                !savedMessageIds.has(messageKey) &&
                !savingMessageIds.has(messageKey)
              );
            }
          );

          for (const message of unsavedMessages) {
            const role = copilotRoleToString(message.role);
            const messageKey = buildMessageKey(thread.id, message.id);

            // Mark as saving to prevent duplicate saves
            setSavingMessageIds((prev) => {
              const next = new Set(prev);
              next.add(messageKey);
              return next;
            });

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

            try {
              if (!shouldSkip) {
                await saveMessageMutation.mutateAsync({
                  threadId: thread.id,
                  role,
                  content: message.content,
                  metadata: { saved: true },
                });
              }

              // Mark as saved and remove from saving set
              setSavedMessageIds((prev) => {
                const next = new Set(prev);
                next.add(messageKey);
                return next;
              });
            } catch (err) {
              console.error(`Failed to save message ${message.id}:`, err);
            } finally {
              // Remove from saving set regardless of success/failure
              setSavingMessageIds((prev) => {
                const next = new Set(prev);
                next.delete(messageKey);
                return next;
              });
            }
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
    [
      messages,
      thread,
      user,
      autoSave,
      savedMessageIds,
      updateTitle,
      saveMessageMutation,
      savingMessageIds,
    ]
  );

  return {
    thread,
    isLoading,
    error,
    saveCurrentThread,
    loadThread,
    updateTitle,
  };
}
