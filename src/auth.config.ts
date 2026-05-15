/**
 * Edge-safe Auth.js config — no Node.js-only APIs, no Prisma.
 * Used by middleware (runs in Edge Runtime).
 * The full config in src/auth.ts extends this and adds Prisma adapter + providers.
 */
import type { NextAuthConfig } from "next-auth";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/set-password",
  "/api/auth",
];

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-email",
    newUser: "/dashboard",
  },

  callbacks: {
    // Called by middleware to decide whether to allow the request
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
      if (isPublic) return true;
      return !!auth?.user;
    },

    // Read-only JWT callback — no DB calls, safe for Edge Runtime
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role?: string }).role ?? "DEVELOPER";
      }
      return token;
    },

    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  // Providers are injected in src/auth.ts — none needed here for middleware
  providers: [],
} satisfies NextAuthConfig;
