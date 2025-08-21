"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import PicoInput from "@/components/input/pico-input";
import { useAuth } from "@/providers/auth-provider";
import {
  createThread,
  saveMessage,
  generateThreadTitle,
  deleteThread,
} from "@/lib/supabase/chat";

export function ChatAfterLogin() {
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const creatingRef = useRef(false);

  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (value: string) => {
    if (!user || creatingRef.current) return;

    let newThreadId: string | null = null;
    try {
      creatingRef.current = true;
      setIsCreating(true);

      const valueTrimmed = value.trim();
      if (valueTrimmed.length === 0) {
        return;
      }
      const title = generateThreadTitle(valueTrimmed);

      // Create thread in Supabase
      const thread = await createThread({
        userId: user.id,
        title,
      });
      newThreadId = thread.id;

      // Save the first message
      await saveMessage({
        threadId: thread.id,
        role: "user",
        content: valueTrimmed,
        metadata: {
          saved: true,
          isFirstMessage: true,
        },
      });

      // Store initial message in sessionStorage for CopilotChat initialization
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`pico:init:${thread.id}`, valueTrimmed);
        }
      } catch {}

      // Navigate to the chat thread page with real thread ID
      router.push(`/c/${thread.id}`);
    } catch (error) {
      console.error(
        "[-][ChatAfterLogin] Failed to create thread and save message:",
        error
      );

      // Best-effort cleanup to prevent orphan threads when message save fails
      try {
        if (newThreadId) {
          await deleteThread(newThreadId);
          newThreadId = null;
        }
      } catch (cleanupErr) {
        console.warn(
          "[-][ChatAfterLogin] Orphan-thread cleanup failed:",
          cleanupErr
        );
      }

      // Show error message to user
      toast.error("Unable to create new chat", {
        description: "Please try again or try again later.",
        action: {
          label: "Retry",
          onClick: () => handleSubmit(value),
        },
      });
    } finally {
      creatingRef.current = false;
      setIsCreating(false);
    }
  };

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
                    <BreadcrumbPage>Home</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
            </div>
          </div>
        </header>
        <div className="flex-1 min-h-0">
          <PicoInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            disabled={isCreating}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
