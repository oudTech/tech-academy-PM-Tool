"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, KanbanSquare, Zap, Users, BarChart3,
  ListTodo, Rocket, ShieldCheck, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn, ROLE_CONFIG } from "@/lib/utils";

const navigation = [
  { name: "Dashboard",    href: "/dashboard", icon: LayoutDashboard },
  { name: "Kanban Board", href: "/board",      icon: KanbanSquare },
  { name: "Tasks",        href: "/tasks",      icon: ListTodo },
  { name: "Sprints",      href: "/sprints",    icon: Rocket },
  { name: "Team",         href: "/team",       icon: Users },
  { name: "Analytics",   href: "/analytics",  icon: BarChart3 },
];

const adminNavigation = [
  { name: "Team Members", href: "/admin/team-members", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  return (
    <aside
      style={{ width: sidebarOpen ? 220 : 52 }}
      className={cn(
        "fixed top-0 left-0 h-full z-30 flex flex-col transition-[width] duration-200 ease-in-out",
        "bg-sidebar border-r border-sidebar-border overflow-hidden"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-12 border-b border-sidebar-border shrink-0 px-3">
        <div className="h-6 w-6 rounded bg-navy-600 flex items-center justify-center shrink-0">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        {sidebarOpen && (
          <div className="ml-2.5 min-w-0 flex-1">
            <p className="text-sidebar-foreground font-semibold text-[13px] leading-none truncate">TechAcademy PM</p>
          </div>
        )}
        {sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
        <div className="px-2 space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!sidebarOpen ? item.name : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-150 group relative",
                  isActive
                    ? "bg-white/[0.07] text-white border-l-2 border-white/60 pl-[6px]"
                    : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/[0.04] border-l-2 border-transparent pl-[6px]"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-sidebar-foreground/40")} />
                {sidebarOpen && <span className="truncate">{item.name}</span>}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded text-xs font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {user?.role === "ADMIN" && (
          <div className="mt-4 px-2">
            {sidebarOpen && (
              <p className="px-2 mb-1 text-[10px] uppercase tracking-widest text-sidebar-foreground/30 font-medium">
                Admin
              </p>
            )}
            {!sidebarOpen && <div className="h-px bg-sidebar-border mx-1 mb-2" />}
            <div className="space-y-0.5">
              {adminNavigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!sidebarOpen ? item.name : undefined}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-1.5 rounded text-[13px] font-medium transition-colors duration-150 group relative",
                      isActive
                        ? "bg-white/[0.07] text-white"
                        : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/[0.04]"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.name}</span>}
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded text-xs font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      {user && (
        <div className="border-t border-sidebar-border shrink-0">
          {!sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center py-2 text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
          <div className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 hover:bg-sidebar-accent transition-colors cursor-pointer",
            !sidebarOpen && "justify-center"
          )}>
            <div className="relative shrink-0">
              <UserAvatar src={user.avatar} className="h-6 w-6" />
              <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-sidebar" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-sidebar-foreground text-[13px] font-medium truncate leading-none mb-0.5">{user.name}</p>
                <p className="text-sidebar-foreground/40 text-[11px] truncate">
                  {ROLE_CONFIG[user.role]?.label || user.role}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
