"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { useSocketContext } from "@/providers/socket-provider";
import { useSocketStore } from "@/store/socket-store";
import { useAuthStore } from "@/store/auth-store";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn, formatRelativeTime } from "@/lib/utils";

const ROOM_ID = "chat:clproject001";

interface TeamChatProps {
  onClose: () => void;
}

export function TeamChat({ onClose }: TeamChatProps) {
  const socket = useSocketContext();
  const { user } = useAuthStore();
  const messages = useSocketStore((s) => s.chatMessages[ROOM_ID] ?? []);
  const setChatMessages = useSocketStore((s) => s.setChatMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;
    socket.emit("room:join", ROOM_ID);
    fetch(`/api/chat?roomId=${ROOM_ID}`)
      .then((r) => r.json())
      .then(({ messages: history }) => {
        if (history) setChatMessages(ROOM_ID, history);
      })
      .catch(() => {});
    return () => {
      socket.emit("room:leave", ROOM_ID);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = () => {
    if (!socket || !input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    socket.emit("chat:send", { roomId: ROOM_ID, content }, () => setSending(false));
  };

  return (
    <div className="flex flex-col h-full border-l border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Team Chat</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <p className="text-center text-[12px] text-muted-foreground/40 pt-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.author.id === user?.id;
          return (
            <div key={msg.id} className={cn("flex gap-2.5", isOwn && "flex-row-reverse")}>
              <UserAvatar src={msg.author.avatar} className="h-6 w-6 shrink-0 mt-0.5" />
              <div className={cn("max-w-[80%]", isOwn && "items-end flex flex-col")}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-medium text-muted-foreground">{msg.author.name}</span>
                  <span className="text-[10px] text-muted-foreground/40">
                    {formatRelativeTime(msg.createdAt)}
                  </span>
                </div>
                <div
                  className={cn(
                    "text-[13px] rounded-lg px-3 py-2 break-words",
                    isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Message team…"
            className="flex-1 bg-muted text-[13px] rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-border"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
