"use client";

import { useCallback, useRef } from "react";
import { useSocketContext } from "@/providers/socket-provider";
import { useSocketStore } from "@/store/socket-store";

export function useTyping(roomId: string, taskId?: string) {
  const socket = useSocketContext();
  const typingUsers = useSocketStore((s) => s.typingUsers[roomId] ?? []);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTyping = useCallback(() => {
    if (!socket) return;
    socket.emit("typing:start", { roomId, taskId });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { roomId, taskId });
    }, 3000);
  }, [socket, roomId, taskId]);

  const stopTyping = useCallback(() => {
    if (!socket) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    socket.emit("typing:stop", { roomId, taskId });
  }, [socket, roomId, taskId]);

  return { typingUsers, startTyping, stopTyping };
}
