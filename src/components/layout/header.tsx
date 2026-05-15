"use client";

import { useState, useEffect } from "react";
import {
  Menu, Search, Bell, LogOut, User, Settings, ChevronDown,
  CheckCircle2, AlertCircle, MessageSquare, Zap,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ConnectionStatus } from "@/components/realtime/connection-status";
import { cn, formatRelativeTime } from "@/lib/utils";

const notifIcons: Record<string, typeof Bell> = {
  TASK_ASSIGNED: CheckCircle2,
  COMMENT_ADDED: MessageSquare,
  PR_REVIEW:     Zap,
  SPRINT_UPDATE: AlertCircle,
};

export function Header() {
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const {
    notifications, unreadCount, notificationsOpen,
    setNotificationsOpen, markNotificationRead, markAllNotificationsRead, setNotifications,
    toggleChat,
  } = useUIStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => { if (d.notifications) setNotifications(d.notifications); })
      .catch(() => {});
  }, []);

  const handleMarkRead = async (id: string) => {
    markNotificationRead(id);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  const handleMarkAllRead = async () => {
    markAllNotificationsRead();
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    }).catch(() => {});
  };

  return (
    <>
      <header className="h-12 border-b border-border bg-background sticky top-0 z-20 flex items-center px-3 gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, sprints, team..."
            className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-muted/40 border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <ConnectionStatus />

          {/* Chat toggle */}
          <button
            onClick={toggleChat}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Team Chat"
          >
            <MessageSquare className="h-4 w-4" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotificationsOpen(!notificationsOpen); setUserMenuOpen(false); }}
              className="relative p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 max-w-[calc(100vw-1rem)] bg-popover border border-border rounded shadow-lg z-50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-[13px] font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-[11px] text-primary hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Bell className="h-6 w-6 mb-2 opacity-20" />
                      <p className="text-xs">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const Icon = notifIcons[notif.type] || Bell;
                      return (
                        <button
                          key={notif.id}
                          onClick={() => handleMarkRead(notif.id)}
                          className={cn(
                            "w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-accent transition-colors border-b border-border/40 last:border-0",
                            !notif.read && "bg-primary/5"
                          )}
                        >
                          <div className={cn(
                            "h-6 w-6 rounded flex items-center justify-center shrink-0 mt-0.5",
                            !notif.read ? "bg-primary/10" : "bg-muted"
                          )}>
                            <Icon className={cn("h-3.5 w-3.5", !notif.read ? "text-primary" : "text-muted-foreground")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-[12px] leading-snug", !notif.read && "font-medium")}>
                              {notif.message}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {formatRelativeTime(notif.createdAt)}
                            </p>
                          </div>
                          {!notif.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); }}
              className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-accent transition-colors"
            >
              <UserAvatar src={user?.avatar} className="h-6 w-6" />
              <span className="hidden md:block text-[13px] font-medium">{user?.name}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded shadow-lg z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-[13px] font-medium truncate">{user?.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  {[
                    { icon: User,     label: "Profile" },
                    { icon: Settings, label: "Settings" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[13px] rounded hover:bg-accent transition-colors"
                    >
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[13px] rounded hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Click-outside overlay */}
      {(notificationsOpen || userMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setNotificationsOpen(false); setUserMenuOpen(false); }}
        />
      )}
    </>
  );
}
