"use client";

import { useSocketStore } from "@/store/socket-store";

interface TypingIndicatorProps {
  roomId: string;
  currentUserId: string;
}

export function TypingIndicator({ roomId, currentUserId }: TypingIndicatorProps) {
  const typingUsers = useSocketStore((s) =>
    (s.typingUsers[roomId] ?? []).filter((u) => u.id !== currentUserId)
  );

  if (typingUsers.length === 0) return null;

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0].name} is typing…`
      : typingUsers.length === 2
      ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing…`
      : `${typingUsers.length} people are typing…`;

  return (
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60 px-1">
      <span className="flex gap-0.5 items-center">
        <span className="h-1 w-1 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
        <span className="h-1 w-1 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
        <span className="h-1 w-1 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
      </span>
      <span>{label}</span>
    </div>
  );
}
