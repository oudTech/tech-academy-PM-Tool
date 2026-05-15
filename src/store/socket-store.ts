import { create } from "zustand";
import type { ChatMessageEvent, UserRef } from "@/lib/socket/types";

interface SocketStore {
  connected: boolean;
  connecting: boolean;
  presence: Record<string, UserRef[]>;
  typingUsers: Record<string, UserRef[]>;
  chatMessages: Record<string, ChatMessageEvent[]>;
  setConnected: (v: boolean) => void;
  setConnecting: (v: boolean) => void;
  setRoomPresence: (roomId: string, users: UserRef[]) => void;
  addTypingUser: (roomId: string, user: UserRef) => void;
  removeTypingUser: (roomId: string, userId: string) => void;
  addChatMessage: (msg: ChatMessageEvent) => void;
  setChatMessages: (roomId: string, messages: ChatMessageEvent[]) => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  connected: false,
  connecting: false,
  presence: {},
  typingUsers: {},
  chatMessages: {},

  setConnected: (connected) => set({ connected }),
  setConnecting: (connecting) => set({ connecting }),

  setRoomPresence: (roomId, users) =>
    set((s) => ({ presence: { ...s.presence, [roomId]: users } })),

  addTypingUser: (roomId, user) =>
    set((s) => {
      const current = s.typingUsers[roomId] ?? [];
      if (current.some((u) => u.id === user.id)) return s;
      return { typingUsers: { ...s.typingUsers, [roomId]: [...current, user] } };
    }),

  removeTypingUser: (roomId, userId) =>
    set((s) => ({
      typingUsers: {
        ...s.typingUsers,
        [roomId]: (s.typingUsers[roomId] ?? []).filter((u) => u.id !== userId),
      },
    })),

  addChatMessage: (msg) =>
    set((s) => {
      const current = s.chatMessages[msg.roomId] ?? [];
      return { chatMessages: { ...s.chatMessages, [msg.roomId]: [...current, msg] } };
    }),

  setChatMessages: (roomId, messages) =>
    set((s) => ({ chatMessages: { ...s.chatMessages, [roomId]: messages } })),
}));
