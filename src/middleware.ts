import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

// Use the edge-safe config (no Prisma) so middleware runs in Edge Runtime cleanly
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  // req.auth is typed by Auth.js — available because we use the auth() wrapper
  const session = req.auth;

  const PUBLIC_PATHS = [
    "/login", "/register", "/verify-email",
    "/forgot-password", "/reset-password", "/set-password", "/api/auth",
  ];
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (!session?.user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only route guard
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (session.user.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Forward user identity to API route handlers via headers
  const headers = new Headers(req.headers);
  headers.set("x-user-id", session.user.id ?? "");
  headers.set("x-user-role", session.user.role ?? "");
  headers.set("x-user-email", session.user.email ?? "");
  headers.set("x-user-name", session.user.name ?? "");

  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
