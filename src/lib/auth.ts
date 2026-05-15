/**
 * Compatibility layer — all existing API routes call getSession() /
 * getSessionFromRequest() and receive the same { sub, email, name, role }
 * shape they always did. Internally we now read from the Auth.js JWT.
 */
import { auth } from "@/auth";
import type { NextRequest } from "next/server";

export interface SessionUser {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    sub: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: session.user.role ?? "DEVELOPER",
  };
}

/**
 * Used by API route handlers. Auth.js reads the cookie automatically
 * from Next.js request context — the request parameter is kept for
 * interface compatibility but is not needed.
 */
export async function getSessionFromRequest(
  _request: NextRequest,
): Promise<SessionUser | null> {
  return getSession();
}

// Keep legacy export names so nothing else needs updating
export type { SessionUser as JWTPayload };
