"use client"

import * as React from "react"
import Link from "next/link"
import {
  Home,
  Inbox,
  Search,
  Settings,
  Users,
  FileText,
  BarChart,
  Calendar,
  HelpCircle,
  LogOut,
  ChevronUp,
  User2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// Main navigation items
const mainNavItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
    badge: "3",
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
]

// Projects with sub-items
const projectItems = [
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart,
    items: [
      {
        title: "Overview",
        url: "/analytics/overview",
      },
      {
        title: "Reports",
        url: "/analytics/reports",
      },
      {
        title: "Metrics",
        url: "/analytics/metrics",
      },
    ],
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
    items: [
      {
        title: "All Documents",
        url: "/documents/all",
      },
      {
        title: "Recent",
        url: "/documents/recent",
      },
      {
        title: "Shared",
        url: "/documents/shared",
      },
    ],
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
]

// Support items
const supportItems = [
  {
    title: "Help Center",
    url: "/help",
    icon: HelpCircle,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const [openItems, setOpenItems] = React.useState<string[]>([])

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-lg font-semibold">T</span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">TKHwang Pico</span>
                  <span className="text-xs text-muted-foreground">Web Application</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects */}
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <>
                      <SidebarMenuButton
                        onClick={() => toggleItem(item.title)}
                        className="cursor-pointer"
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                        <ChevronUp
                          className={`ml-auto size-4 transition-transform ${openItems.includes(item.title) ? "" : "rotate-180"
                            }`}
                        />
                      </SidebarMenuButton>
                      {openItems.includes(item.title) && (
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support */}
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="w-full">
              <User2 className="size-4" />
              <div className="flex flex-col gap-0.5 leading-none text-left">
                <span className="font-medium text-sm">John Doe</span>
                <span className="text-xs text-muted-foreground">john@example.com</span>
              </div>
              <LogOut className="ml-auto size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}