"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageSquare, Calendar, GitPullRequest, Bug, ArrowUpRight } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn, PRIORITY_CONFIG, TYPE_CONFIG, MODULE_CONFIG, formatDate } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  isDragging?: boolean;
}

const priorityDotClass: Record<string, string> = {
  LOW:      "bg-white/20",
  MEDIUM:   "bg-blue-400",
  HIGH:     "bg-orange-400",
  CRITICAL: "bg-red-400",
};

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: sortableDragging } = useSortable({
    id: task.id,
    data: { task, type: "task" },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const typeConfig   = TYPE_CONFIG[task.type];
  const moduleConfig = task.module ? MODULE_CONFIG[task.module.module] : null;
  const commentCount = task.comments?.length || (task as unknown as { _count?: { comments: number } })._count?.comments || 0;
  const isOverdue    = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative bg-card border border-border rounded p-2.5 cursor-grab active:cursor-grabbing",
        "hover:border-border/80 hover:bg-card/80 transition-colors duration-100",
        (sortableDragging || isDragging) && "opacity-40 shadow-xl"
      )}
      onClick={() => { if (!sortableDragging) onClick(task); }}
    >
      {/* Top row: type label + priority dot */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-muted-foreground/60">
          {typeConfig?.icon} {typeConfig?.label}
        </span>
        <div className="flex items-center gap-1.5">
          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", priorityDotClass[task.priority])} />
          <span className="text-[11px] text-muted-foreground/50">
            {PRIORITY_CONFIG[task.priority]?.label}
          </span>
        </div>
      </div>

      {/* Title */}
      <p className="text-[13px] font-medium leading-snug line-clamp-2 mb-2 text-foreground">{task.title}</p>

      {/* Module tag */}
      {moduleConfig && (
        <div
          className="inline-flex items-center gap-1 mb-2 px-1.5 py-0.5 rounded text-[11px] font-medium"
          style={{ background: "rgba(100,88,72,0.15)", color: "#7a6a58" }}
        >
          <moduleConfig.icon className="h-3 w-3" />
          <span>{task.module!.name}</span>
        </div>
      )}

      {/* Metadata row */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {task.storyPoints && (
          <span className="text-[11px] text-muted-foreground font-medium">{task.storyPoints}pt</span>
        )}
        {task.dueDate && (
          <div className={cn("flex items-center gap-1 text-[11px]", isOverdue ? "text-red-400" : "text-muted-foreground")}>
            <Calendar className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </div>
        )}
        {(task.linkedPRs?.length ?? 0) > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <GitPullRequest className="h-3 w-3" />
            <span>PR</span>
          </div>
        )}
        {task.type === "BUG" && task.bugSeverity && (
          <div className="flex items-center gap-1 text-[11px] text-red-400">
            <Bug className="h-3 w-3" />
            {task.bugSeverity}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {commentCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span className="text-[11px]">{commentCount}</span>
            </div>
          )}
          <UserAvatar src={task.assignee?.avatar} className="h-5 w-5" />
        </div>
      </div>

      <button
        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-accent"
        onClick={(e) => { e.stopPropagation(); onClick(task); }}
      >
        <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}
