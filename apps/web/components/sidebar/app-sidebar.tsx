'use client';

import * as React from 'react';

import { PicoLogo } from '@/components/pico-logo';
import { NavChatHistory } from '@/components/sidebar/nav-chat-history';
import { NavChats } from '@/components/sidebar/nav-chats';
import { NavUser } from '@/components/sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuth } from '@/providers/auth-provider';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Account';
  const email = user?.email ?? '';
  const avatar = user?.imageUrl || undefined;
  const userData = { name, email, avatar: avatar as string };

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
