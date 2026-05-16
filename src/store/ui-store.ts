import { create } from "zustand";
import type { Notification } from "@/types";

interface UIState {
  sidebarOpen: boolean;
  chatOpen: boolean;
  notificationsOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
  isTaskModalOpen: boolean;
  isSprintModalOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
  setNotificationsOpen: (open: boolean) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setTaskModalOpen: (open: boolean) => void;
  setSprintModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  chatOpen: false,
  notificationsOpen: false,
  notifications: [],
  unreadCount: 0,
  isTaskModalOpen: false,
  isSprintModalOpen: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setChatOpen: (open) => set({ chatOpen: open }),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter((n) => !n.read).length }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  setTaskModalOpen: (open) => set({ isTaskModalOpen: open }),
  setSprintModalOpen: (open) => set({ isSprintModalOpen: open }),
}));
