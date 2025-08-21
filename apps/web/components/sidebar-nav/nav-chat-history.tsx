"use client";

import { MoreHorizontal, Edit3, Trash2 } from "lucide-react";

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
import Link from "next/link";

export interface ChatItem {
  id: string;
  title: string;
  timestamp?: Date;
  url?: string;
}

// Mock data based on the image
const mockChatHistory: ChatItem[] = [
  { id: "1", title: "RoutingAgent vNext 활용법" },
  { id: "2", title: "Routing agent 설계 방법" },
  { id: "3", title: "CopilotChat 채널 agent 호출" },
  { id: "4", title: "Mastra vNext의 CopilotKit 통합" },
  { id: "5", title: "Mastra vNext 예제" },
];

export function NavChatHistory({
  chatHistory = mockChatHistory,
}: {
  chatHistory?: ChatItem[];
}) {
  const { isMobile } = useSidebar();

  const handleChatClick = (chatItem: ChatItem) => {
    // TODO: Implement chat navigation
    console.log("Chat clicked:", chatItem.title);
  };

  const handleEditChat = (chatItem: ChatItem) => {
    // TODO: Implement chat title editing
    console.log("Edit chat:", chatItem.title);
  };

  const handleDeleteChat = (chatItem: ChatItem) => {
    // TODO: Implement chat deletion
    console.log("Delete chat:", chatItem.title);
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-sm text-gray-500">
        Chats
      </SidebarGroupLabel>
      <SidebarMenu>
        {chatHistory.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild className="w-full justify-start">
              <Link
                href={item.url ?? `/c/${item.id}`}
                onClick={() => handleChatClick(item)}
                aria-label={`Open chat: ${item.title}`}
              >
                <span className="sidebar-text-truncate">{item.title}</span>
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
                <DropdownMenuItem onClick={() => handleEditChat(item)}>
                  <Edit3 className="text-muted-foreground" />
                  <span>Edit Chat</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteChat(item)}
                  className="text-destructive"
                >
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Chat</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
