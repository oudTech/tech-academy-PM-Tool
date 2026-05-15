import { jwtVerify } from "jose";
import type { AppSocket } from "./index";

const secret = new TextEncoder().encode(
  process.env.SOCKET_SECRET ?? "socket-fallback-secret-change-in-production"
);

export async function socketAuthMiddleware(
  socket: AppSocket,
  next: (err?: Error) => void
) {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) return next(new Error("AUTH_REQUIRED"));

  try {
    const { payload } = await jwtVerify(token, secret);
    socket.data.user = {
      sub: payload.sub as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as string,
    };
    next();
  } catch {
    next(new Error("AUTH_INVALID"));
  }
}
