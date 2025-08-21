"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import {
  ChatToolCheckIntent,
  ChatToolDetectLanguage,
  ChatToolGenerateFallback,
  ChatToolHandleRequest,
  ChatToolWeather,
} from "@/components/chat/chat-render-tools";

/**
 * Custom hook that registers all copilot actions for chat tools
 */
export function useCopilotActions() {
  useCopilotAction({
    name: "weatherTool",
    available: "disabled",
    render: ({ status, args }) => {
      return <ChatToolWeather status={status} args={args} />;
    },
  });

  useCopilotAction({
    name: "checkRequestIntent",
    available: "disabled",
    render: ({ status, args }) => {
      return <ChatToolCheckIntent status={status} args={args} />;
    },
  });

  useCopilotAction({
    name: "detectLanguage",
    available: "disabled",
    render: ({ status, args }) => {
      return <ChatToolDetectLanguage status={status} args={args} />;
    },
  });

  useCopilotAction({
    name: "generateFallbackMessage",
    available: "disabled",
    render: ({ status, args }) => {
      return <ChatToolGenerateFallback status={status} args={args} />;
    },
  });

  useCopilotAction({
    name: "handleUserRequest",
    available: "disabled",
    render: ({ status, args }) => {
      return <ChatToolHandleRequest status={status} args={args} />;
    },
  });
}