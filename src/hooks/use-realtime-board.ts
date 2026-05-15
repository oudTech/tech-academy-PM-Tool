"use client";

import { useEffect, useRef } from "react";
import { useSocketContext } from "@/providers/socket-provider";
import { useAuthStore } from "@/store/auth-store";
import { rooms } from "@/lib/socket/rooms";
import type { Task } from "@/types";
import type { TaskEvent, TaskDeleteEvent, TaskMoveEvent } from "@/lib/socket/types";

interface Options {
  projectId: string;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
  onTaskMoved?: (taskId: string, toStatus: string) => void;
}

export function useRealtimeBoard({ projectId, onTaskCreated, onTaskUpdated, onTaskDeleted, onTaskMoved }: Options) {
  const socket = useSocketContext();
  const { user } = useAuthStore();

  // Use refs so effect doesn't re-run when callbacks change identity
  const cbRef = useRef({ onTaskCreated, onTaskUpdated, onTaskDeleted, onTaskMoved });
  cbRef.current = { onTaskCreated, onTaskUpdated, onTaskDeleted, onTaskMoved };

  const userIdRef = useRef(user?.id);
  userIdRef.current = user?.id;

  useEffect(() => {
    if (!socket || !projectId) return;

    const roomId = rooms.board(projectId);
    socket.emit("room:join", roomId);

    const handleCreated = ({ task, triggeredBy }: TaskEvent) => {
      if (triggeredBy.id === userIdRef.current) return;
      cbRef.current.onTaskCreated?.(task);
    };
    const handleUpdated = ({ task, triggeredBy }: TaskEvent) => {
      if (triggeredBy.id === userIdRef.current) return;
      cbRef.current.onTaskUpdated?.(task);
    };
    const handleDeleted = ({ taskId, triggeredBy }: TaskDeleteEvent) => {
      if (triggeredBy.id === userIdRef.current) return;
      cbRef.current.onTaskDeleted?.(taskId);
    };
    const handleMoved = ({ taskId, toStatus, triggeredBy }: TaskMoveEvent) => {
      if (triggeredBy.id === userIdRef.current) return;
      cbRef.current.onTaskMoved?.(taskId, toStatus);
    };

    socket.on("task:created", handleCreated);
    socket.on("task:updated", handleUpdated);
    socket.on("task:deleted", handleDeleted);
    socket.on("task:moved", handleMoved);

    return () => {
      socket.emit("room:leave", roomId);
      socket.off("task:created", handleCreated);
      socket.off("task:updated", handleUpdated);
      socket.off("task:deleted", handleDeleted);
      socket.off("task:moved", handleMoved);
    };
  }, [socket, projectId]);
}
