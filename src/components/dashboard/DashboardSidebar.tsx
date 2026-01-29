import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Newspaper,
  Ghost,
  Home,
  ShoppingBag,
  MessageCircle,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Campus Gists", url: "/feed", icon: Newspaper },
  { title: "Anonymous Zone", url: "/anonymous", icon: Ghost },
  { title: "Hostel Hub", url: "/hostel", icon: Home },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Academic", url: "/academic", icon: BookOpen },
];

const secondaryNavItems = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

const DashboardSidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            {!isCollapsed && (
              <span className="font-display font-bold text-lg">
                Big<span className="text-primary">Scott</span>
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn("shrink-0", isCollapsed && "hidden")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Search */}
        {!isCollapsed && (
          <div className="px-2 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-muted/50 rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className={cn(isCollapsed && "sr-only")}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={cn(isCollapsed && "sr-only")}>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <Avatar className="w-9 h-9">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className={cn("shrink-0", isCollapsed && "hidden")}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mt-2 w-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
