import type { Task } from "@/types";

export interface UserRef {
  id: string;
  name: string;
  avatar?: string;
}

export interface TaskEvent {
  task: Task;
  triggeredBy: UserRef;
}

export interface TaskDeleteEvent {
  taskId: string;
  projectId: string;
  triggeredBy: UserRef;
}

export interface TaskMoveEvent {
  taskId: string;
  projectId: string;
  fromStatus: string;
  toStatus: string;
  triggeredBy: UserRef;
}

export interface PresenceEvent {
  roomId: string;
  users: UserRef[];
}

export interface TypingEvent {
  roomId: string;
  taskId?: string;
  user: UserRef;
}

export interface ChatMessageEvent {
  id: string;
  content: string;
  roomId: string;
  author: UserRef;
  createdAt: string;
}

export interface NotificationEvent {
  id: string;
  type: string;
  message: string;
  link?: string;
  taskId?: string;
  sender?: UserRef;
}

export interface SprintEvent {
  sprintId: string;
  projectId: string;
  changes: Record<string, unknown>;
  triggeredBy: UserRef;
}

export interface ServerToClientEvents {
  "task:created": (event: TaskEvent) => void;
  "task:updated": (event: TaskEvent) => void;
  "task:deleted": (event: TaskDeleteEvent) => void;
  "task:moved": (event: TaskMoveEvent) => void;
  "presence:update": (event: PresenceEvent) => void;
  "typing:start": (event: TypingEvent) => void;
  "typing:stop": (event: TypingEvent) => void;
  "chat:message": (event: ChatMessageEvent) => void;
  "notification:new": (event: NotificationEvent) => void;
  "sprint:updated": (event: SprintEvent) => void;
}

export interface ClientToServerEvents {
  "room:join": (roomId: string) => void;
  "room:leave": (roomId: string) => void;
  heartbeat: () => void;
  "typing:start": (data: { roomId: string; taskId?: string }) => void;
  "typing:stop": (data: { roomId: string; taskId?: string }) => void;
  "chat:send": (
    data: { roomId: string; content: string },
    callback: (result: { ok: boolean; message?: ChatMessageEvent; error?: string }) => void
  ) => void;
}

export interface SocketData {
  user: {
    sub: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}
