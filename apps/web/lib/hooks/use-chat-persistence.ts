import { useCallback, useEffect, useState } from "react";
import { useCopilotMessagesContext } from "@copilotkit/react-core";
import { TextMessage, Role as gqlRole } from "@copilotkit/runtime-client-gql";
import { useAuth } from "@/providers/auth-provider";
import {
  createThread,
  saveMessage,
  getThreadWithMessages,
  updateThreadTitle,
  generateThreadTitle,
  type Thread,
  type Message,
} from "../supabase/chat";

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

        // Convert to CopilotKit message format and restore them
        const copilotMessages = threadMessages.map((msg: Message) => {
          const role = msg.role === "user" ? gqlRole.User : gqlRole.Assistant;
          return new TextMessage({
            id: msg.id,
            role,
            content: msg.content,
            createdAt: msg.created_at,
          });
        });

        // Restore messages in CopilotKit
        setMessages(copilotMessages);
        setThread(thread);

        // Mark all loaded messages as saved to prevent re-saving
        const messageKeys = threadMessages.map(
          (msg) => `${threadId}-${msg.content}`
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

  const saveCurrentThread = useCallback(async (): Promise<Thread | null> => {
    if (!user || messages.length === 0) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Create new thread if none exists
      let currentThread = thread;
      if (!currentThread) {
        const firstUserMessage = messages.find(
          (m) => m instanceof TextMessage && m.role === gqlRole.User
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

        const messageKey = `${currentThread.id}-${message.content}`;
        if (savedMessageIds.has(messageKey)) continue;

        const role = message.role === gqlRole.User ? "user" : "assistant";

        await saveMessage({
          threadId: currentThread.id,
          role,
          content: message.content,
          metadata: { saved: true },
        });

        // Mark as saved
        setSavedMessageIds((prev) => new Set(prev).add(messageKey));
      }

      return currentThread;
    } catch (err) {
      console.error("Failed to save thread:", err);
      setError(err instanceof Error ? err.message : "Failed to save thread");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, messages, thread, savedMessageIds]);

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

  // Load thread and its messages on mount
  useEffect(() => {
    if (threadId && user) {
      loadThread(threadId);
    }
  }, [loadThread, threadId, user]);

  // Auto-save messages when they change
  useEffect(() => {
    if (!autoSave || !user || !thread || messages.length === 0) return;

    const saveMessages = async () => {
      try {
        // Find all unsaved messages
        const unsavedMessages = messages.filter((msg): msg is TextMessage => {
          if (!(msg instanceof TextMessage)) return false;

          // Skip if we've already saved this content for this thread
          const messageKey = `${thread.id}-${msg.content}`;
          return !savedMessageIds.has(messageKey);
        });

        for (const message of unsavedMessages) {
          const role = message.role === gqlRole.User ? "user" : "assistant";
          const messageKey = `${thread.id}-${message.content}`;

          // Skip if already processing this message
          if (savedMessageIds.has(messageKey)) continue;

          // Mark as being saved
          setSavedMessageIds((prev) => new Set(prev).add(messageKey));

          await saveMessage({
            threadId: thread.id,
            role,
            content: message.content,
            metadata: { saved: true },
          });
        }

        // Update thread title if needed (only for user messages)
        const userMessages = messages.filter(
          (m) => m instanceof TextMessage && m.role === gqlRole.User
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
  }, [messages, thread, user, autoSave, savedMessageIds, updateTitle]);

  return {
    thread,
    isLoading,
    error,
    saveCurrentThread,
    loadThread,
    updateTitle,
  };
}
