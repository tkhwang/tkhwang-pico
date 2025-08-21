"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotKit, useCopilotAction } from "@copilotkit/react-core";
import { AppSidebar } from "@/components/sidebar-nav/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  ChatToolCheckIntent,
  ChatToolDetectLanguage,
  ChatToolGenerateFallback,
  ChatToolHandleRequest,
  ChatToolWeather,
} from "@/components/chat/chat-render-tools";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, use } from "react";
import { useCopilotChat } from "@copilotkit/react-core";
import { TextMessage, Role as gqlRole } from "@copilotkit/runtime-client-gql";
import { getConfig } from "@/lib/config";
import { useChatPersistence } from "@/lib/hooks/use-chat-persistence";

interface ChatThreadPageProps {
  params: Promise<{
    threadId: string;
  }>;
}

function ThreadChatInner({ threadId }: { threadId: string }) {
  const searchParams = useSearchParams();
  const { appendMessage } = useCopilotChat();
  const hasSentInitialRef = useRef(false);

  // Initialize chat persistence
  const {
    thread,
    isLoading: isPersistenceLoading,
    error: persistenceError,
  } = useChatPersistence({
    threadId,
    autoSave: true,
  });

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

  // Send the initial user message exactly once per thread
  useEffect(() => {
    if (hasSentInitialRef.current || isPersistenceLoading) return;

    // If we have existing messages (loaded from DB), don't send initial message
    if (thread && thread.id === threadId) {
      hasSentInitialRef.current = true;
      return;
    }

    // Prefer sessionStorage (no URL leak), fallback to ?q for backward-compat
    let initial = "";
    try {
      if (typeof window !== "undefined") {
        const key = `pico:init:${threadId}`;
        const stored = sessionStorage.getItem(key);
        if (stored) {
          initial = stored;
          sessionStorage.removeItem(key);
        }
      }
    } catch {}

    if (!initial) {
      const q = searchParams.get("q");
      if (q) initial = q;
    }

    if (initial.trim().length > 0) {
      hasSentInitialRef.current = true;
      // Send the message that was already saved
      const message = new TextMessage({
        role: gqlRole.User,
        content: initial.trim(),
      });
      try {
        if (typeof window !== "undefined") {
          // Inform persistence to skip saving this runtime message id
          sessionStorage.setItem(`pico:skip-saves:${threadId}`, message.id);
        }
      } catch {}
      void appendMessage(message);
    }
  }, [appendMessage, searchParams, threadId, thread, isPersistenceLoading]);

  // Show error if persistence fails
  if (persistenceError) {
    console.error(
      "[-][ThreadChatInner] Chat persistence error:",
      persistenceError
    );
  }

  return (
    <div className="h-full w-full max-w-3xl mx-auto">
      {isPersistenceLoading && (
        <div className="text-sm text-muted-foreground p-2">
          Loading chat history...
        </div>
      )}
      <CopilotChat
        instructions="You are assisting the user as PICO, a personal intelligent companion operator."
        className="h-full w-full"
        labels={{
          title: thread?.title || "Your Assistant",
        }}
      />
    </div>
  );
}

export default function ChatThreadPage({ params }: ChatThreadPageProps) {
  const { threadId } = use(params);

  const config = getConfig();

  return (
    <CopilotKit
      key={threadId}
      publicLicenseKey={config.copilotKit.publicLicenseKey}
      runtimeUrl={config.mastra.copilotKitUrl}
      agent="routingAgent"
      showDevConsole={false}
      threadId={threadId}
    >
      <SidebarProvider className="min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 shrink-0 items-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
            <div className="flex w-full items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      PICO
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Chat</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
              </div>
            </div>
          </header>
          <div className="flex-1 p-4 min-h-0">
            <ThreadChatInner key={threadId} threadId={threadId} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CopilotKit>
  );
}
