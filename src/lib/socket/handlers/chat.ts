import type { AppServer, AppSocket } from "../index";
import { prisma } from "@/lib/prisma";

export function registerChatHandlers(io: AppServer, socket: AppSocket) {
  const { sub: userId } = socket.data.user;

  socket.on("chat:send", async ({ roomId, content }, callback) => {
    try {
      if (!content.trim()) return callback({ ok: false, error: "Empty message" });

      // Ensure chat room exists (id IS the roomId, e.g. "chat:clproject001")
      const projectId = roomId.replace("chat:", "");
      await prisma.chatRoom.upsert({
        where: { id: roomId },
        update: {},
        create: { id: roomId, name: "Project Chat", projectId },
      });

      const message = await prisma.chatMessage.create({
        data: { content: content.trim(), chatRoomId: roomId, authorId: userId },
        include: { author: { select: { id: true, name: true, avatar: true } } },
      });

      const event = {
        id: message.id,
        content: message.content,
        roomId,
        author: {
          id: message.author.id,
          name: message.author.name,
          avatar: message.author.avatar ?? undefined,
        },
        createdAt: message.createdAt.toISOString(),
      };

      io.to(roomId).emit("chat:message", event);
      callback({ ok: true, message: event });
    } catch (err) {
      console.error("chat:send error:", err);
      callback({ ok: false, error: "Failed to send" });
    }
  });
}
