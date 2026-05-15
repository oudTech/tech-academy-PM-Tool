import type { AppServer } from "../index";
import { socketAuthMiddleware } from "../auth-middleware";
import { registerPresenceHandlers } from "./presence";
import { registerTypingHandlers } from "./typing";
import { registerChatHandlers } from "./chat";

export function registerHandlers(io: AppServer) {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id} (${socket.data.user?.name})`);

    registerPresenceHandlers(io, socket);
    registerTypingHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`[socket] disconnected: ${socket.id} (${reason})`);
    });
  });
}
