"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { use } from "react";

import { ChatPageSkeleton } from "@/components/chat/chat-page-skeleton";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
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
import { useSaveMessage } from "@/hooks/mutations/use-save-message";
import { useChatPersistence } from "@/hooks/use-chat-persistence";
import { useCopilotActions } from "@/hooks/use-copilot-actions";
import { getConfig } from "@/lib/config";

interface ChatThreadPageProps {
  params: Promise<{
    threadId: string;
  }>;
}

function ThreadChatInner({ threadId }: { threadId: string }) {
  const { mutateAsync: saveMessageMutate } = useSaveMessage(threadId);

  const {
    thread,
    isLoading: isPersistenceLoading,
    error: persistenceError,
  } = useChatPersistence({
    threadId,
  });

  useCopilotActions();

  if (persistenceError) {
    console.error(
      "[-][ThreadChatInner] Chat persistence error:",
      persistenceError,
    );
  }

  return (
    <div className="h-full w-full max-w-3xl mx-auto">
      {isPersistenceLoading && <ChatPageSkeleton />}
      <CopilotChat
        instructions="You are assisting the user as PICO, a personal intelligent companion operator."
        className="h-full w-full"
        labels={{
          title: thread?.title || "Your Assistant",
        }}
        onSubmitMessage={async (message: string) => {
          const content = message.trim();
          if (!content) return;
          await saveMessageMutate({ threadId, role: "user", content });
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
