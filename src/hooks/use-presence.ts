"use client";

import { useEffect } from "react";
import { useSocketContext } from "@/providers/socket-provider";
import { useSocketStore } from "@/store/socket-store";

export function usePresence(roomId: string) {
  const socket = useSocketContext();
  const users = useSocketStore((s) => s.presence[roomId] ?? []);

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("room:join", roomId);
    return () => {
      socket.emit("room:leave", roomId);
    };
  }, [socket, roomId]);

  return users;
}
