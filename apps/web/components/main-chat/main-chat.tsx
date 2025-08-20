"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";
import { MainChatToolWeather } from "./tool/main-chat-tool-weather";
import { AppSidebar } from "@/components/app-sidebar";
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

export function MainChat() {
  useCopilotAction({
    name: "weatherTool",
    available: "disabled",
    render: ({ status, args }) => {
      return <MainChatToolWeather status={status} args={args} />;
    },
  });

  useCopilotAction({
    name: "detectLanguage",
    available: "disabled",
    render: () => {
      return (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
          <span className="text-blue-600">🔍</span>
          <span className="text-sm">언어 감지 중...</span>
        </div>
      );
    },
  });

  useCopilotAction({
    name: "generateFallbackMessage",
    available: "disabled",
    render: () => {
      return (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <span className="text-gray-600">💬</span>
          <span className="text-sm">응답 메시지 생성 중...</span>
        </div>
      );
    },
  });

  useCopilotAction({
    name: "checkRequestIntent",
    available: "disabled",
    render: () => {
      return (
        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
          <span className="text-purple-600">🎯</span>
          <span className="text-sm">요청 의도 분석 중...</span>
        </div>
      );
    },
  });

  useCopilotAction({
    name: "handleUserRequest",
    available: "disabled",
    render: () => {
      return (
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
          <span className="text-green-600">⚙️</span>
          <span className="text-sm">라우팅 네트워크 처리 중...</span>
        </div>
      );
    },
  });

  return (
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
          <CopilotChat
            instructions="You are assisting the user as PICO, a personal intelligent companion operator."
            className="h-full w-full"
            labels={{
              title: "Your Assistant",
              initial: "Hi! 👋 How can I assist you today?",
            }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
