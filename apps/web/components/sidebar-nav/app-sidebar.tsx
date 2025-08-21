"use client";

import * as React from "react";

import { NavUser } from "@/components/sidebar-nav/nav-user";
import { PicoLogo } from "@/components/pico-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth-provider";
import { NavChats } from "@/components/sidebar-nav/nav-chats";
import { NavChatHistory } from "@/components/sidebar-nav/nav-chat-history";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const userData = {
    name: user?.user_metadata?.name,
    email: user?.user_metadata?.email,
    avatar: user?.user_metadata?.avatar_url,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <PicoLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavChats />
        <NavChatHistory />
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
