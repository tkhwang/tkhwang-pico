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
    name: "checkRequestIntent",
    available: "disabled",
    render: ({ status }) => {
      return <ChatToolCheckIntent status={status} />;
    },
  });

  useCopilotAction({
    name: "detectLanguage",
    available: "disabled",
    render: ({ status, result }) => {
      return <ChatToolDetectLanguage status={status} result={result} />;
    },
  });

  useCopilotAction({
    name: "generateFallbackMessage",
    available: "disabled",
    render: ({ status }) => {
      return <ChatToolGenerateFallback status={status} />;
    },
  });

  useCopilotAction({
    name: "handleUserRequest",
    available: "disabled",
    render: ({ status }) => {
      return <ChatToolHandleRequest status={status} />;
    },
  });

  useCopilotAction({
    name: "weatherTool",
    available: "disabled",
    render: ({ status }) => {
      return <ChatToolWeather status={status} />;
    },
  });
}
