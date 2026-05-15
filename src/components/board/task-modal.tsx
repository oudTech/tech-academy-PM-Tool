"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  X, User, Calendar, Tag, GitPullRequest, MessageSquare,
  Clock, Layers, Bug, CheckSquare, Edit3, Save, Trash2,
  Link2, ChevronDown, Loader2,
} from "lucide-react";
import { taskSchema, type TaskInput } from "@/lib/validations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  cn, PRIORITY_CONFIG, STATUS_CONFIG, TYPE_CONFIG, MODULE_CONFIG,
  formatRelativeTime, formatDateTime,
} from "@/lib/utils";
import type { Task, User as UserType, ProjectModule } from "@/types";

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  onDelete: (id: string) => Promise<boolean>;
  users: UserType[];
  modules: ProjectModule[];
  currentUserId: string;
}

export function TaskModal({ task, isOpen, onClose, onUpdate, onDelete, users, modules, currentUserId }: TaskModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [localTask, setLocalTask] = useState<Task | null>(task);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setLocalTask(task); setIsEditing(false); }, [task]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
        acceptanceCriteria: task.acceptanceCriteria || "",
        type: task.type,
        status: task.status,
        priority: task.priority,
        storyPoints: task.storyPoints || undefined,
        estimatedHours: task.estimatedHours || undefined,
        actualHours: task.actualHours || undefined,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : undefined,
        assigneeId: task.assigneeId || undefined,
        moduleId: task.moduleId || undefined,
        projectId: task.projectId,
      });
    }
  }, [task, reset]);

  const handleSave = async (data: TaskInput) => {
    if (!task) return;
    setIsSaving(true);
    const updated = await onUpdate(task.id, data);
    if (updated) {
      setLocalTask(updated);
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleQuickStatusChange = async (status: Task["status"]) => {
    if (!task) return;
    const updated = await onUpdate(task.id, { status });
    if (updated) setLocalTask(updated);
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !task) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      if (res.ok) {
        const data = await res.json();
        setLocalTask((prev) => prev ? {
          ...prev,
          comments: [...(prev.comments || []), data.comment],
        } : prev);
        setComment("");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!localTask) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="text-lg">{TYPE_CONFIG[localTask.type]?.icon}</span>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  {...register("title")}
                  className="text-lg font-semibold w-full bg-transparent border-b-2 border-primary focus:outline-none pb-0.5"
                  autoFocus
                />
              ) : (
                <h2 className="text-lg font-semibold leading-tight">{localTask.title}</h2>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-[11px]">
                  {localTask.id.slice(0, 8).toUpperCase()}
                </Badge>
                <Badge className={cn("text-[11px]", STATUS_CONFIG[localTask.status]?.bg, STATUS_CONFIG[localTask.status]?.color, "border-0")}>
                  {STATUS_CONFIG[localTask.status]?.label}
                </Badge>
                <Badge className={cn("text-[11px]", PRIORITY_CONFIG[localTask.priority]?.bg, PRIORITY_CONFIG[localTask.priority]?.color, "border-0")}>
                  {PRIORITY_CONFIG[localTask.priority]?.label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4 shrink-0">
            {isEditing ? (
              <>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSubmit(handleSave)} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { onDelete(localTask.id); onClose(); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Left: Main content */}
            <div className="lg:col-span-2 p-4 lg:p-6 space-y-5 lg:border-r border-border">
              {/* Description */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Description</h4>
                {isEditing ? (
                  <Textarea
                    {...register("description")}
                    placeholder="Add a description..."
                    className="min-h-[100px] text-sm"
                  />
                ) : (
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {localTask.description || <span className="text-muted-foreground italic">No description</span>}
                  </p>
                )}
              </div>

              {/* Acceptance Criteria */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Acceptance Criteria</h4>
                {isEditing ? (
                  <Textarea
                    {...register("acceptanceCriteria")}
                    placeholder="Define done criteria..."
                    className="min-h-[80px] text-sm font-mono"
                  />
                ) : (
                  <div className="text-sm whitespace-pre-wrap font-mono text-foreground/80 leading-relaxed bg-muted/30 rounded-lg p-3">
                    {localTask.acceptanceCriteria || <span className="text-muted-foreground italic not-italic font-sans">No criteria defined</span>}
                  </div>
                )}
              </div>

              {/* Quick status change */}
              {!isEditing && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(STATUS_CONFIG) as Task["status"][]).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleQuickStatusChange(s)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          localTask.status === s
                            ? cn(STATUS_CONFIG[s]?.bg, STATUS_CONFIG[s]?.color, "ring-2 ring-offset-1 ring-current")
                            : "bg-muted hover:bg-accent text-muted-foreground"
                        )}
                      >
                        {STATUS_CONFIG[s]?.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked PRs */}
              {localTask.linkedPRs?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground flex items-center gap-1.5">
                    <GitPullRequest className="h-4 w-4" /> Linked Pull Requests
                  </h4>
                  <div className="space-y-1.5">
                    {localTask.linkedPRs.map((pr, i) => (
                      <a key={i} href={pr} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        {pr.split("/").slice(-2).join("/")}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Comments */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" /> Comments ({localTask.comments?.length || 0})
                </h4>

                <div className="space-y-4 mb-4">
                  {(localTask.comments || []).map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <UserAvatar src={c.author?.avatar} className="h-7 w-7 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{c.author?.name}</span>
                          <span className="text-xs text-muted-foreground">{formatRelativeTime(c.createdAt)}</span>
                        </div>
                        <p className="text-sm mt-1 text-foreground/80">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment... Use @username to mention"
                    className="flex-1 min-h-[70px] text-sm resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddComment();
                    }}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button size="sm" onClick={handleAddComment} disabled={!comment.trim() || isSubmittingComment}>
                    {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : "Comment"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Metadata */}
            <div className="p-4 lg:p-6 space-y-4 bg-muted/20 border-t lg:border-t-0 border-border">
              {/* Assignee */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assignee</label>
                <div className="mt-2">
                  {isEditing ? (
                    <Select onValueChange={(v) => setValue("assigneeId", v === "none" ? undefined : v)} defaultValue={localTask.assigneeId || "none"}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : localTask.assignee ? (
                    <div className="flex items-center gap-2 mt-1">
                      <UserAvatar src={localTask.assignee.avatar} className="h-7 w-7" />
                      <span className="text-sm">{localTask.assignee.name}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">Unassigned</p>
                  )}
                </div>
              </div>

              {/* Module */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Module</label>
                <div className="mt-2">
                  {isEditing ? (
                    <Select onValueChange={(v) => setValue("moduleId", v === "none" ? undefined : v)} defaultValue={localTask.moduleId || "none"}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="No module" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No module</SelectItem>
                        {modules.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : localTask.module ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[12px] mt-1"
                      style={{ background: "rgba(100,88,72,0.15)", color: "#7a6a58" }}
                    >
                      {(() => { const Ic = MODULE_CONFIG[localTask.module.module]?.icon; return Ic ? <Ic className="h-3 w-3" /> : null; })()}
                      {localTask.module.name}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No module</p>
                  )}
                </div>
              </div>

              {/* Story points */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Story Points</label>
                {isEditing ? (
                  <Input {...register("storyPoints", { valueAsNumber: true })} type="number" min="0" max="100" className="mt-2 h-9" />
                ) : (
                  <p className="text-sm mt-1 font-medium">{localTask.storyPoints ?? "—"}</p>
                )}
              </div>

              {/* Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Est. Hours</label>
                  {isEditing ? (
                    <Input {...register("estimatedHours", { valueAsNumber: true })} type="number" min="0" className="mt-2 h-9" />
                  ) : (
                    <p className="text-sm mt-1">{localTask.estimatedHours ?? "—"}h</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actual</label>
                  {isEditing ? (
                    <Input {...register("actualHours", { valueAsNumber: true })} type="number" min="0" className="mt-2 h-9" />
                  ) : (
                    <p className="text-sm mt-1">{localTask.actualHours ?? "—"}h</p>
                  )}
                </div>
              </div>

              {/* Due date */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</label>
                {isEditing ? (
                  <Input {...register("dueDate")} type="date" className="mt-2 h-9" />
                ) : (
                  <p className={cn("text-sm mt-1", localTask.dueDate && new Date(localTask.dueDate) < new Date() ? "text-red-500" : "")}>
                    {localTask.dueDate ? new Date(localTask.dueDate).toLocaleDateString() : "No deadline"}
                  </p>
                )}
              </div>

              <Separator />

              {/* Meta */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Creator</span>
                  <span>{localTask.creator?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created</span>
                  <span>{formatDateTime(localTask.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Updated</span>
                  <span>{formatRelativeTime(localTask.updatedAt)}</span>
                </div>
              </div>

              {/* Priority selector in edit mode */}
              {isEditing && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</label>
                  <Select onValueChange={(v) => setValue("priority", v as Task["priority"])} defaultValue={localTask.priority}>
                    <SelectTrigger className="mt-2 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
