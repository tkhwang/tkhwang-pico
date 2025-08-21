"use client";

import * as React from "react";
import { Frame } from "lucide-react";

import { NavProjects } from "@/components/sidebar-nav/nav-projects";
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

// This is sample data.
const data = {
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
  ],
};

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
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
