'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import PicoInput from '@/components/input/pico-input';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { ThemeSwitcher } from '@/components/theme-switcher';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useCreateThread } from '@/hooks/mutations/use-create-thread';
import { useSaveMessage } from '@/hooks/mutations/use-save-message';
import { generateThreadTitle } from '@/lib/supabase/threads';
import { useAuth } from '@/providers/auth-provider';

export function ChatAfterLogin() {
  const [inputValue, setInputValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const creatingRef = useRef(false);

  const router = useRouter();
  const { user } = useAuth();
  const { mutateAsync: saveMessageMutate } = useSaveMessage();
  const { mutateAsync: createThreadMutate } = useCreateThread();

  const handleSubmit = async (userMessage: string) => {
    if (!user || creatingRef.current) return;

    try {
      creatingRef.current = true;
      setIsCreating(true);

      const userMessageTrimmed = userMessage.trim();
      if (userMessageTrimmed.length === 0) {
        return;
      }
      const title = generateThreadTitle(userMessageTrimmed);

      // Create thread in Supabase (with cache update)
      const thread = await createThreadMutate({
        title,
      });

      // Persist initial user message to DB
      await saveMessageMutate({
        threadId: thread.id,
        role: 'user',
        content: userMessageTrimmed,
        metadata: { initial: true },
      });

      // Navigate to the chat thread page with real thread ID; page will read from DB
      router.push(`/c/${thread.id}`);
    } catch (error) {
      console.error('[-][ChatAfterLogin] Failed to create thread and save message:', error);

      // No message was pre-saved; no orphan-message cleanup required

      // Show error message to user
      toast.error('Unable to create new chat', {
        description: 'Please try again or try again later.',
        action: {
          label: 'Retry',
          onClick: () => handleSubmit(userMessage),
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
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">PICO</BreadcrumbItem>
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
