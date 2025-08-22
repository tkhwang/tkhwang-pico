"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  saveMessage,
  type Message,
  type SaveMessageParams,
} from "@/lib/supabase/chat";
import { UseThreadWithMessagesResult } from "@/hooks/queries/use-thread-with-messages-query";

export function useSaveMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation<Message, Error, SaveMessageParams>({
    mutationFn: async (params) => {
      // Check if message already exists in cache to prevent duplicates
      const threadData = queryClient.getQueryData<UseThreadWithMessagesResult>([
        "thread-with-messages",
        params.threadId,
      ]);

      if (threadData) {
        // Check for exact duplicate based on content, role, and recent timestamp
        const recentTimeThreshold = Date.now() - 5000; // 5 seconds
        const existingMessage = threadData.messages.find((msg) => {
          if (!msg.created_at) return false;
          const msgTime = new Date(msg.created_at).getTime();
          return (
            msg.content === params.content &&
            msg.role === params.role &&
            msgTime > recentTimeThreshold
          );
        });

        if (existingMessage) {
          console.log(
            "Duplicate message detected, skipping save:",
            params.content.substring(0, 50)
          );
          return existingMessage;
        }
      }

      return await saveMessage(params);
    },
    onSuccess: (newMessage, variables) => {
      // Update thread-with-messages cache by adding the new message
      queryClient.setQueryData<UseThreadWithMessagesResult>(
        ["thread-with-messages", variables.threadId],
        (oldData) => {
          if (!oldData) return oldData;

          // Check if message already exists in the cache
          const messageExists = oldData.messages.some(
            (msg) => msg.id === newMessage.id
          );

          if (messageExists) {
            return oldData; // Don't add duplicate
          }

          return {
            ...oldData,
            messages: [...oldData.messages, newMessage],
          };
        }
      );

      // Also update the legacy thread cache key for compatibility
      queryClient.setQueryData(
        ["thread", variables.threadId],
        (oldData: { thread: unknown; messages: Message[] } | undefined) => {
          if (!oldData) return oldData;

          // Check if message already exists in the cache
          const messageExists = oldData.messages.some(
            (msg) => msg.id === newMessage.id
          );

          if (messageExists) {
            return oldData; // Don't add duplicate
          }

          return {
            ...oldData,
            messages: [...oldData.messages, newMessage],
          };
        }
      );

      // Invalidate threads list to update last message timestamp
      queryClient.invalidateQueries({
        queryKey: ["threads"],
      });
    },
    onError: (error, variables) => {
      console.error(
        `Failed to save message for thread ${variables.threadId}:`,
        error
      );
    },
  });
}
