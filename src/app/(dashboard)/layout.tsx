"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TeamChat } from "@/components/chat/team-chat";
import { SocketProvider } from "@/providers/socket-provider";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import type { User } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setUser } = useAuthStore();
  const { sidebarOpen, chatOpen, setChatOpen } = useUIStore();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "",
        avatar: session.user.image ?? undefined,
        role: (session.user.role as User["role"]) ?? "DEVELOPER",
        isOnline: true,
        skills: [],
        createdAt: new Date().toISOString(),
      } as User);
    }
  }, [status, session, setUser, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div
          className="flex flex-col flex-1 overflow-hidden transition-[margin] duration-200 ease-in-out"
          style={{ marginLeft: sidebarOpen ? 220 : 52 }}
        >
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto scrollbar-thin p-4">{children}</main>
            {chatOpen && (
              <div className="w-72 shrink-0 overflow-hidden">
                <TeamChat onClose={() => setChatOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}
