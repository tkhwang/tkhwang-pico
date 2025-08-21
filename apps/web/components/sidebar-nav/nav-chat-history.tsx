"use client";

import { MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useThreads } from "@/lib/hooks/use-threads";

export function NavChatHistory() {
  const { isMobile } = useSidebar();
  const { threads, isLoading, error, deleteThreadById } = useThreads();
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);

  const handleEditChat = (threadId: string) => {
    // TODO: Implement chat title editing
    console.log("Edit chat:", threadId);
  };

  const handleDeleteChat = async (threadId: string) => {
    if (deletingThreadId) return; // Prevent multiple deletions

    try {
      setDeletingThreadId(threadId);
      await deleteThreadById(threadId);
    } catch (err) {
      console.error(
        "[-][NavChatHistory] handleDeleteChat: Failed to delete chat:",
        err
      );
    } finally {
      setDeletingThreadId(null);
    }
  };

  if (error) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="text-sm text-gray-500">
          Chats
        </SidebarGroupLabel>
        <div className="text-sm text-red-500 p-2">Failed to load chats</div>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-sm text-gray-500">
        Chats {isLoading && "(Loading...)"}
      </SidebarGroupLabel>
      <SidebarMenu>
        {threads.map((thread) => (
          <SidebarMenuItem key={thread.id}>
            <SidebarMenuButton asChild className="w-full justify-start">
              <Link
                href={`/c/${thread.id}`}
                aria-label={`Open chat: ${thread.title || "New Chat"}`}
              >
                <span className="sidebar-text-truncate">
                  {thread.title || "New Chat"}
                </span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => handleEditChat(thread.id)}>
                  <Edit3 className="text-muted-foreground" />
                  <span>Edit Chat</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteChat(thread.id)}
                  className="text-destructive"
                  disabled={deletingThreadId === thread.id}
                >
                  <Trash2 className="text-muted-foreground" />
                  <span>
                    {deletingThreadId === thread.id
                      ? "Deleting..."
                      : "Delete Chat"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {threads.length === 0 && !isLoading && (
          <div className="text-sm text-muted-foreground p-2">No chats yet</div>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
