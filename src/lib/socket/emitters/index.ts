import { getIO } from "@/lib/socket";
import { rooms } from "@/lib/socket/rooms";
import type { NotificationEvent, TaskMoveEvent, UserRef } from "@/lib/socket/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTask = any;

export function emitTaskCreated(projectId: string, task: AnyTask, triggeredBy: UserRef) {
  getIO()?.to(rooms.board(projectId)).emit("task:created", { task, triggeredBy });
}

export function emitTaskUpdated(projectId: string, task: AnyTask, triggeredBy: UserRef) {
  const io = getIO();
  io?.to(rooms.board(projectId)).emit("task:updated", { task, triggeredBy });
  io?.to(rooms.task(task.id)).emit("task:updated", { task, triggeredBy });
}

export function emitTaskDeleted(projectId: string, taskId: string, triggeredBy: UserRef) {
  const io = getIO();
  io?.to(rooms.board(projectId)).emit("task:deleted", { taskId, projectId, triggeredBy });
  io?.to(rooms.task(taskId)).emit("task:deleted", { taskId, projectId, triggeredBy });
}

export function emitTaskMoved(projectId: string, event: TaskMoveEvent) {
  getIO()?.to(rooms.board(projectId)).emit("task:moved", event);
}

export function emitNotification(userId: string, event: NotificationEvent) {
  getIO()?.to(rooms.user(userId)).emit("notification:new", event);
}
