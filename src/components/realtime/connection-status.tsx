"use client";

import { useSocketStore } from "@/store/socket-store";
import { cn } from "@/lib/utils";

export function ConnectionStatus() {
  const { connected, connecting } = useSocketStore();

  return (
    <div
      title={connected ? "Real-time connected" : connecting ? "Connecting…" : "Offline"}
      className="flex items-center gap-1.5 select-none"
    >
      <div
        className={cn(
          "h-1.5 w-1.5 rounded-full transition-colors duration-300",
          connected ? "bg-green-500" : connecting ? "bg-yellow-500 animate-pulse" : "bg-muted-foreground/25"
        )}
      />
      <span className="text-[11px] text-muted-foreground/50 hidden sm:inline">
        {connected ? "Live" : connecting ? "Connecting" : "Offline"}
      </span>
    </div>
  );
}
