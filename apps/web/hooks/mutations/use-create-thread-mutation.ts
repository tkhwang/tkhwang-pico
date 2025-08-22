"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createThread,
  saveMessage,
  generateThreadTitle,
  type Thread,
} from "@/lib/supabase/chat";

interface CreateThreadWithMessageParams {
  userId: string;
  content: string;
  title?: string;
}

interface CreateThreadWithMessageResult {
  thread: Thread;
  messageId: string;
}

export function useCreateThreadMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateThreadWithMessageResult,
    Error,
    CreateThreadWithMessageParams
  >({
    mutationFn: async ({ userId, content, title }) => {
      // Generate title if not provided
      const threadTitle = title || generateThreadTitle(content);

      // Create thread
      const thread = await createThread({
        userId,
        title: threadTitle,
      });

      // Save the first message
      const message = await saveMessage({
        threadId: thread.id,
        role: "user",
        content,
        metadata: {
          saved: true,
          isFirstMessage: true,
        },
      });

      return {
        thread,
        messageId: message.id,
      };
    },
    onSuccess: (data, variables) => {
      // Invalidate threads query to refresh sidebar
      queryClient.invalidateQueries({
        queryKey: ["threads", variables.userId],
      });

      // Set initial data for the new thread query
      queryClient.setQueryData(["thread", data.thread.id], {
        thread: data.thread,
        messages: [
          {
            id: data.messageId,
            thread_id: data.thread.id,
            role: "user",
            content: variables.content,
            metadata: {
              saved: true,
              isFirstMessage: true,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });
    },
    onError: (error) => {
      console.error("Failed to create thread with message:", error);
    },
  });
}
