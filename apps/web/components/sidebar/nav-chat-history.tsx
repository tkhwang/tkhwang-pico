"use client";

import { MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useThreads } from "@/hooks/use-threads";
import { Input } from "@/components/ui/input";
import { NavChatHistorySkeleton } from "@/components/sidebar/nav-chat-history-skeleton";
import { useDeleteThreadMutation } from "@/hooks/mutations/use-delete-thread-mutation";
import { useUpdateThreadTitleMutation } from "@/hooks/mutations/use-update-thread-title-mutation";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

export function NavChatHistory() {
  const { isMobile } = useSidebar();
  const { user } = useAuth();
  const { threads, isLoading, error } = useThreads();
  const pathname = usePathname();

  // Extract current threadId from pathname (/c/threadId)
  const currentThreadId = pathname?.split("/c/")[1];

  const [editingTitle, setEditingTitle] = useState("");
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);

  const updateTitleMutation = useUpdateThreadTitleMutation();
  const deleteThreadMutation = useDeleteThreadMutation();

  const handleEditChat = (threadId: string) => {
    const currentTitle = threads.find((t) => t.id === threadId)?.title || "";
    setEditingThreadId(threadId);
    setEditingTitle(currentTitle);
  };

  const handleDeleteChat = async (threadId: string) => {
    if (deleteThreadMutation.isPending) return; // Prevent multiple deletions

    try {
      await deleteThreadMutation.mutateAsync({
        threadId,
        userId: user?.id,
      });
    } catch (err) {
      console.error(
        "[-][NavChatHistory] handleDeleteChat: Failed to delete chat:",
        err
      );
    }
  };

  const submitRename = async () => {
    if (!editingThreadId) return;
    const newTitle = editingTitle.trim();
    const original = threads.find((t) => t.id === editingThreadId)?.title || "";
    if (newTitle === original.trim()) {
      setEditingThreadId(null);
      setEditingTitle("");
      return;
    }
    try {
      await updateTitleMutation.mutateAsync({
        threadId: editingThreadId,
        title: newTitle || "",
      });
    } catch (err) {
      console.error(
        "[-][NavChatHistory] submitRename: Failed to rename thread:",
        err
      );
    } finally {
      setEditingThreadId(null);
      setEditingTitle("");
    }
  };

  const cancelRename = () => {
    setEditingThreadId(null);
    setEditingTitle("");
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
        Chats
      </SidebarGroupLabel>
      <SidebarMenu>
        {isLoading ? (
          <NavChatHistorySkeleton />
        ) : (
          threads.map((thread) => (
            <SidebarMenuItem key={thread.id}>
              {editingThreadId === thread.id ? (
                <div className="w-full px-2 py-1.5">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    autoFocus
                    disabled={updateTitleMutation.isPending}
                    onBlur={submitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitRename();
                      if (e.key === "Escape") cancelRename();
                    }}
                    className="h-8 border-border/40 focus-visible:ring-0 focus-visible:border-border/60 shadow-none"
                    aria-label="Edit chat title"
                  />
                </div>
              ) : (
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "w-full justify-start",
                    currentThreadId === thread.id &&
                      "font-bold bg-accent text-accent-foreground"
                  )}
                >
                  <Link
                    href={`/c/${thread.id}`}
                    aria-label={`Open chat: ${thread.title || "New Chat"}`}
                  >
                    <span className="sidebar-text-truncate">
                      {thread.title || "New Chat"}
                    </span>
                  </Link>
                </SidebarMenuButton>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-xl p-2"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem
                    onClick={() => handleEditChat(thread.id)}
                    className="h-9 px-3"
                  >
                    <Edit3 className="text-muted-foreground" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteChat(thread.id)}
                    variant="destructive"
                    className="h-9 px-3"
                    disabled={deleteThreadMutation.isPending}
                  >
                    <Trash2 className="text-muted-foreground" />
                    <span>
                      {deleteThreadMutation.isPending
                        ? "Deleting..."
                        : "Delete"}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}
        {threads.length === 0 && !isLoading && (
          <div className="text-sm text-muted-foreground p-2">No chats yet</div>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
