"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  isOver?: boolean;
}

const STATUS_DOT: Record<string, string> = {
  BACKLOG:     "bg-white/20",
  TODO:        "bg-navy-400",
  IN_PROGRESS: "bg-blue-500",
  REVIEW:      "bg-amber-500",
  TESTING:     "bg-cyan-500",
  DONE:        "bg-green-500",
};

export function KanbanColumn({ id, title, tasks, onTaskClick, onAddTask, isOver }: KanbanColumnProps) {
  const { setNodeRef, isOver: droppableOver } = useDroppable({ id, data: { type: "column", status: id } });

  const isHighlighted = isOver || droppableOver;

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-2 px-0.5">
        <div className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[id])} />
        <h3 className="text-[13px] font-semibold flex-1 truncate">{title}</h3>
        <span className="text-[11px] text-muted-foreground font-medium tabular-nums min-w-[1.5rem] text-right">
          {tasks.length}
        </span>
        <button
          onClick={() => onAddTask(id)}
          className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 rounded p-1.5 min-h-[480px] transition-colors duration-150",
          isHighlighted
            ? "bg-primary/5 ring-1 ring-primary/30 ring-dashed"
            : "bg-muted/20"
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isHighlighted && (
          <div className="flex items-center justify-center h-24 text-muted-foreground/30">
            <p className="text-xs">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
