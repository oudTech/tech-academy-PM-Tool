"use client";

import { usePresence } from "@/hooks/use-presence";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

interface PresenceAvatarsProps {
  roomId: string;
  currentUserId: string;
  max?: number;
}

export function PresenceAvatars({ roomId, currentUserId, max = 5 }: PresenceAvatarsProps) {
  const users = usePresence(roomId);
  const others = users.filter((u) => u.id !== currentUserId);
  const visible = others.slice(0, max);
  const overflow = others.length - max;

  if (visible.length === 0) return null;

  return (
    <div className="flex items-center">
      {visible.map((u, i) => (
        <div
          key={u.id}
          className={cn("relative", i > 0 && "-ml-2")}
          style={{ zIndex: visible.length - i }}
          title={u.name}
        >
          <UserAvatar src={u.avatar} className="h-6 w-6 ring-2 ring-background" />
        </div>
      ))}
      {overflow > 0 && (
        <div className="-ml-2 h-6 w-6 rounded-full bg-muted ring-2 ring-background flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground">+{overflow}</span>
        </div>
      )}
    </div>
  );
}
