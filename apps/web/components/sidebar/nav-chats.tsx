"use client";

import { MessageSquarePlus, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavChats() {
  const router = useRouter();

  const handleNewChat = () => {
    // Simply navigate to home page for new chat
    router.push("/");
  };

  const handleSearchChats = () => {
    // TODO: Implement search chats functionality
    console.log("Search chats clicked");
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleNewChat}>
            <MessageSquarePlus />
            <span className="sidebar-text-truncate">New chat</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleSearchChats}>
            <Search />
            <span className="sidebar-text-truncate">Search chats</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
