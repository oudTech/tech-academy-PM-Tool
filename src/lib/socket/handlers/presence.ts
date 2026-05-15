import type { AppServer, AppSocket } from "../index";
import { rooms } from "../rooms";
import type { UserRef } from "../types";

interface PresenceEntry {
  userId: string;
  name: string;
  avatar?: string;
  roomIds: Set<string>;
}

const presenceMap = new Map<string, PresenceEntry>();

export function registerPresenceHandlers(io: AppServer, socket: AppSocket) {
  const { sub: userId, name, avatar } = socket.data.user;

  presenceMap.set(socket.id, { userId, name, avatar, roomIds: new Set() });

  // Auto-join personal notification room
  socket.join(rooms.user(userId));

  socket.on("room:join", (roomId) => {
    socket.join(roomId);
    const entry = presenceMap.get(socket.id);
    if (entry) entry.roomIds.add(roomId);
    broadcastPresence(io, roomId);
  });

  socket.on("room:leave", (roomId) => {
    socket.leave(roomId);
    const entry = presenceMap.get(socket.id);
    if (entry) entry.roomIds.delete(roomId);
    broadcastPresence(io, roomId);
  });

  socket.on("heartbeat", () => {});

  socket.on("disconnect", () => {
    const entry = presenceMap.get(socket.id);
    if (entry) {
      const affectedRooms = Array.from(entry.roomIds);
      presenceMap.delete(socket.id);
      affectedRooms.forEach((roomId) => broadcastPresence(io, roomId));
    }
  });
}

function broadcastPresence(io: AppServer, roomId: string) {
  const seen = new Set<string>();
  const users: UserRef[] = [];

  Array.from(presenceMap.values()).forEach((entry) => {
    if (entry.roomIds.has(roomId) && !seen.has(entry.userId)) {
      seen.add(entry.userId);
      users.push({ id: entry.userId, name: entry.name, avatar: entry.avatar });
    }
  });

  io.to(roomId).emit("presence:update", { roomId, users });
}
