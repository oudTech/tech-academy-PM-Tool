"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/lib/socket/types";
import { useSocketStore } from "@/store/socket-store";
import { useUIStore } from "@/store/ui-store";

export type AppClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SocketContext = createContext<AppClientSocket | null>(null);

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<AppClientSocket | null>(null);
  const socketRef = useRef<AppClientSocket | null>(null);
  const { setConnected, setConnecting, setRoomPresence, addTypingUser, removeTypingUser, addChatMessage } =
    useSocketStore();
  const { addNotification } = useUIStore();

  useEffect(() => {
    let mounted = true;

    async function connect() {
      try {
        setConnecting(true);
        const res = await fetch("/api/socket-auth", { method: "POST" });
        if (!res.ok || !mounted) {
          setConnecting(false);
          return;
        }
        const { token } = (await res.json()) as { token: string };

        const sock = io({
          path: "/socket.io",
          auth: { token },
          reconnection: true,
          reconnectionDelay: 2000,
          reconnectionAttempts: 8,
        }) as AppClientSocket;

        sock.on("connect", () => {
          setConnected(true);
          setConnecting(false);
        });
        sock.on("disconnect", () => setConnected(false));
        sock.on("connect_error", () => {
          setConnected(false);
          setConnecting(false);
        });
        // Manager-level events for reconnection
        sock.io.on("reconnect_attempt", () => setConnecting(true));
        sock.io.on("reconnect", () => {
          setConnected(true);
          setConnecting(false);
        });
        sock.io.on("reconnect_failed", () => {
          setConnected(false);
          setConnecting(false);
        });

        sock.on("presence:update", ({ roomId, users }) => setRoomPresence(roomId, users));
        sock.on("typing:start", ({ roomId, user }) => addTypingUser(roomId, user));
        sock.on("typing:stop", ({ roomId, user }) => removeTypingUser(roomId, user.id));
        sock.on("chat:message", (msg) => addChatMessage(msg));
        sock.on("notification:new", (event) => {
          addNotification({
            id: event.id,
            type: event.type,
            message: event.message,
            read: false,
            recipientId: "",
            link: event.link ?? null,
            taskId: event.taskId ?? null,
            createdAt: new Date().toISOString(),
          });
        });

        socketRef.current = sock;
        if (mounted) setSocket(sock);
      } catch {
        setConnecting(false);
      }
    }

    connect();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
