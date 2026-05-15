import { Server } from "socket.io";
import type { Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import type { ServerToClientEvents, ClientToServerEvents, SocketData } from "./types";

export type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
export type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

declare global {
  // eslint-disable-next-line no-var
  var __io: AppServer | undefined;
}

export function initSocketServer(httpServer: HttpServer): AppServer {
  if (global.__io) return global.__io;

  const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(
    httpServer,
    {
      cors: {
        origin: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    }
  );

  global.__io = io;
  return io;
}

export function getIO(): AppServer | null {
  return global.__io ?? null;
}
