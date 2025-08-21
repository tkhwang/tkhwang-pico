"use client";

import { MessageSquarePlus, Search } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavChats() {
  const handleNewChat = () => {
    // TODO: Implement new chat functionality
    console.log("New chat clicked");
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
