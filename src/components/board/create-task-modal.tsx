"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { taskSchema, type TaskInput } from "@/lib/validations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Task, TaskStatus, User, ProjectModule } from "@/types";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Partial<Task>) => Promise<Task | null>;
  defaultStatus?: TaskStatus;
  users: User[];
  modules: ProjectModule[];
  currentSprintId?: string;
}

export function CreateTaskModal({
  isOpen, onClose, onCreate, defaultStatus = "BACKLOG", users, modules, currentSprintId,
}: CreateTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: defaultStatus,
      priority: "MEDIUM",
      type: "TASK",
      projectId: "clproject001",
    },
  });

  const onSubmit = async (data: TaskInput) => {
    setIsLoading(true);
    const task = await onCreate({
      ...data,
      sprintId: currentSprintId,
    });
    if (task) {
      reset();
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input {...register("title")} placeholder="Task title..." className="mt-1.5" autoFocus />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea {...register("description")} placeholder="Describe the task..." className="mt-1.5" rows={3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select onValueChange={(v) => setValue("type", v as Task["type"])} defaultValue="TASK">
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["FEATURE", "BUG", "IMPROVEMENT", "TASK", "STORY", "EPIC"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select onValueChange={(v) => setValue("priority", v as Task["priority"])} defaultValue="MEDIUM">
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select onValueChange={(v) => setValue("status", v as Task["status"])} defaultValue={defaultStatus}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "TESTING", "DONE"].map((s) => (
                    <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Story Points</Label>
              <Input
                {...register("storyPoints", { valueAsNumber: true })}
                type="number" min="0" max="100" placeholder="0"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Assignee</Label>
              <Select onValueChange={(v) => setValue("assigneeId", v === "none" ? undefined : v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Module</Label>
              <Select onValueChange={(v) => setValue("moduleId", v === "none" ? undefined : v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="No module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No module</SelectItem>
                  {modules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Due Date</Label>
            <Input {...register("dueDate")} type="date" className="mt-1.5" />
          </div>

          <Input type="hidden" {...register("projectId")} />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
