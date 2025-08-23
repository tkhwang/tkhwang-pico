"use client";

import { MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useThreadsByUserId } from "@/hooks/queries/use-threads-by-user-id";
import { useDeleteThread } from "@/hooks/mutations/use-delete-thread";
import { useUpdateThreadTitle } from "@/hooks/mutations/use-update-thread-title";
import { Input } from "@/components/ui/input";
import { NavChatHistorySkeleton } from "@/components/sidebar/nav-chat-history-skeleton";

export function NavChatHistory() {
  const router = useRouter();
  const params = useParams();
  const { isMobile } = useSidebar();

  const currentThreadId = params.threadId as string;

  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const { data: threads = [], isLoading, error } = useThreadsByUserId();
  const { mutateAsync: deleteThreadById, isPending: isDeletePending } =
    useDeleteThread();
  const { mutateAsync: updateThreadTitleMutation, isPending: isUpdating } =
    useUpdateThreadTitle();

  const handleEditChat = (threadId: string) => {
    const currentTitle = threads.find((t) => t.id === threadId)?.title || "";
    setEditingThreadId(threadId);
    setEditingTitle(currentTitle);
  };

  const handleDeleteChat = async (threadId: string) => {
    if (isDeletePending) return; // Prevent multiple deletions

    try {
      await deleteThreadById(threadId);
      if (currentThreadId === threadId) {
        router.push("/");
      }
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
      await updateThreadTitleMutation({
        threadId: editingThreadId,
        title: newTitle || "",
      });
      setEditingThreadId(null);
      setEditingTitle("");
    } catch (err) {
      console.error(
        "[-][NavChatHistory] submitRename: Failed to rename thread:",
        err
      );
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
          threads.map((thread) => {
            const isCurrentThread = currentThreadId === thread.id;
            return (
              <SidebarMenuItem key={thread.id}>
                {editingThreadId === thread.id ? (
                  <div className="w-full px-2 py-1.5">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      autoFocus
                      disabled={isUpdating}
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
                      isCurrentThread &&
                        "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
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
                      disabled={isDeletePending}
                    >
                      <Trash2 className="text-muted-foreground" />
                      <span>{isDeletePending ? "Deleting..." : "Delete"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            );
          })
        )}
        {threads.length === 0 && !isLoading && (
          <div className="text-sm text-muted-foreground p-2">No chats yet</div>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
