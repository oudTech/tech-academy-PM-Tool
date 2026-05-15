import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { authConfig } from "@/auth.config";
import type { Role } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,   // 7 days
    updateAge: 60 * 60 * 24,    // rotate JWT daily
  },

  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true, email: true, name: true, image: true, avatar: true, role: true, password: true, emailVerified: true, status: true },
        });

        if (!user || !user.password) return null;

        // Unverified accounts cannot sign in via credentials.
        // The login page pre-checks /api/auth/email-status to surface a
        // friendly message; returning null here is the secure fallback.
        if (!user.emailVerified) return null;

        // PENDING users must complete their invite (set-password) first.
        // DISABLED users have been deactivated by an Admin.
        if (user.status !== "ACTIVE") return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? user.avatar ?? undefined,
          role: user.role,
        };
      },
    }),

    ...(process.env.GOOGLE_CLIENT_ID ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      }),
    ] : []),

    ...(process.env.GITHUB_CLIENT_ID ? [
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      }),
    ] : []),
  ],

  callbacks: {
    // Override the edge-safe jwt with the full version that can hit Prisma.
    // This runs in Node.js context (API routes, server components) — NOT in middleware.
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role?: Role }).role ?? "DEVELOPER";
      }

      // Profile update (e.g. settings page calls update())
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.role) token.role = session.role;
      }

      // Daily role refresh from DB (runs in Node.js context only)
      if (!user && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, name: true },
          });
          if (dbUser) token.role = dbUser.role;
        } catch {
          // DB unavailable — keep existing token claims rather than 500ing
        }
      }

      return token;
    },

    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      if (user.id) {
        await prisma.user
          .update({ where: { id: user.id }, data: { isOnline: true } })
          .catch(() => {});
      }
    },

    async signOut(message) {
      const token = (message as { token?: { id?: string } }).token;
      if (token?.id) {
        await prisma.user
          .update({ where: { id: token.id }, data: { isOnline: false } })
          .catch(() => {});
        await prisma.refreshToken
          .updateMany({ where: { userId: token.id }, data: { revoked: true } })
          .catch(() => {});
      }
    },
  },
});
