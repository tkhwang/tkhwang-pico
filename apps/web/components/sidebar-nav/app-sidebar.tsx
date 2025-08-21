"use client";

import * as React from "react";
import { Frame, Settings2 } from "lucide-react";

import { NavMain } from "@/components/sidebar-nav/nav-main";
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

// This is sample data.
const data = {
  navMain: [
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
      ],
    },
  ],
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
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
