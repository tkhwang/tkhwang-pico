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
import { Input } from "@/components/ui/input";
import { updateThreadTitle } from "@/lib/supabase/chat";

export function NavChatHistory() {
  const { isMobile } = useSidebar();
  const { threads, isLoading, error, deleteThreadById, refetch } = useThreads();
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const handleEditChat = (threadId: string) => {
    const currentTitle = threads.find((t) => t.id === threadId)?.title || "";
    setEditingThreadId(threadId);
    setEditingTitle(currentTitle);
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
      setIsRenaming(true);
      await updateThreadTitle(editingThreadId, newTitle || "");
      await refetch();
    } catch (err) {
      console.error(
        "[-][NavChatHistory] submitRename: Failed to rename thread:",
        err
      );
    } finally {
      setIsRenaming(false);
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
        Chats {isLoading && "(Loading...)"}
      </SidebarGroupLabel>
      <SidebarMenu>
        {threads.map((thread) => (
          <SidebarMenuItem key={thread.id}>
            {editingThreadId === thread.id ? (
              <div className="w-full px-2 py-1.5">
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  autoFocus
                  disabled={isRenaming}
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
                  disabled={deletingThreadId === thread.id}
                >
                  <Trash2 className="text-muted-foreground" />
                  <span>
                    {deletingThreadId === thread.id ? "Deleting..." : "Delete"}
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
