"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { ChatGenericToolRender } from "@/components/chat/chat-render-tools";

/**
 * Custom hook that registers all copilot actions for chat tools
 */
export function useCopilotActions() {
  useCopilotAction({
    name: "checkRequestIntent",
    available: "disabled",
    render: ({ status }) => {
      return (
        <ChatGenericToolRender name="checkRequestIntent" status={status} />
      );
    },
  });

  useCopilotAction({
    name: "detectLanguage",
    available: "disabled",
    render: ({ status }) => {
      return <ChatGenericToolRender name="detectLanguage" status={status} />;
    },
  });

  useCopilotAction({
    name: "generateFallbackMessage",
    available: "disabled",
    render: ({ status }) => {
      return (
        <ChatGenericToolRender name="generateFallbackMessage" status={status} />
      );
    },
  });

  useCopilotAction({
    name: "handleUserRequest",
    available: "disabled",
    render: ({ status }) => {
      return <ChatGenericToolRender name="handleUserRequest" status={status} />;
    },
  });

  useCopilotAction({
    name: "weatherTool",
    available: "disabled",
    render: ({ status }) => {
      return <ChatGenericToolRender name="weatherTool" status={status} showElapsedSec={true} />;
    },
  });
}
