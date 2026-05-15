import type { AppServer, AppSocket } from "../index";

const typingTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

export function registerTypingHandlers(_io: AppServer, socket: AppSocket) {
  const { sub: userId, name } = socket.data.user;

  socket.on("typing:start", ({ roomId, taskId }) => {
    const key = `${socket.id}:${roomId}`;

    const existing = typingTimeouts.get(key);
    if (existing) clearTimeout(existing);

    socket.to(roomId).emit("typing:start", { roomId, taskId, user: { id: userId, name } });

    typingTimeouts.set(
      key,
      setTimeout(() => {
        socket.to(roomId).emit("typing:stop", { roomId, taskId, user: { id: userId, name } });
        typingTimeouts.delete(key);
      }, 5000)
    );
  });

  socket.on("typing:stop", ({ roomId, taskId }) => {
    const key = `${socket.id}:${roomId}`;
    const existing = typingTimeouts.get(key);
    if (existing) {
      clearTimeout(existing);
      typingTimeouts.delete(key);
    }
    socket.to(roomId).emit("typing:stop", { roomId, taskId, user: { id: userId, name } });
  });

  socket.on("disconnect", () => {
    Array.from(typingTimeouts.entries()).forEach(([key, timeout]) => {
      if (key.startsWith(socket.id)) {
        clearTimeout(timeout);
        typingTimeouts.delete(key);
      }
    });
  });
}
