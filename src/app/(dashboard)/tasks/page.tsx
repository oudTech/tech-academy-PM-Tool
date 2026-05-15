"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, Filter, SortAsc, ChevronDown, List, Grid,
  Bug, Zap, CheckSquare, BookOpen, Star, Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskModal } from "@/components/board/task-modal";
import { CreateTaskModal } from "@/components/board/create-task-modal";
import { Progress } from "@/components/ui/progress";
import {
  cn, PRIORITY_CONFIG, STATUS_CONFIG, TYPE_CONFIG, MODULE_CONFIG,
  formatDate, formatRelativeTime,
} from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import { useAuthStore } from "@/store/auth-store";
import type { Task, User, ProjectModule } from "@/types";

const TYPE_ICONS = {
  FEATURE: Star,
  BUG: Bug,
  IMPROVEMENT: Zap,
  TASK: CheckSquare,
  STORY: BookOpen,
  EPIC: Layers,
};

export default function TasksPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<ProjectModule[]>([]);
  const [sprints, setSprints] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState("updatedAt");
  const { user } = useAuthStore();
  const { tasks, isLoading, filters, setFilter, fetchTasks, updateTask, deleteTask, createTask } = useTasks();

  useEffect(() => {
    fetchTasks();
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/modules").then((r) => r.json()),
      fetch("/api/sprints").then((r) => r.json()),
    ]).then(([u, m, s]) => {
      setUsers(u.users || []);
      setModules(m.modules || []);
      setSprints(s.sprints || []);
    });
  }, []);

  const filteredAndSorted = [...tasks]
    .filter((task) => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.status !== "ALL" && task.status !== filters.status) return false;
      if (filters.priority !== "ALL" && task.priority !== filters.priority) return false;
      if (filters.assigneeId !== "ALL" && task.assigneeId !== filters.assigneeId) return false;
      if (filters.moduleId !== "ALL" && task.moduleId !== filters.moduleId) return false;
      if (filters.type !== "ALL" && task.type !== filters.type) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (order[a.priority] || 0) - (order[b.priority] || 0);
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleUpdateTask = async (id: string, updates: Partial<Task>): Promise<Task | null> => {
    return updateTask(id, updates);
  };

  const handleCreateTask = async (data: Partial<Task>): Promise<Task | null> => {
    return createTask(data);
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm">{tasks.length} total tasks across all sprints</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 h-9"
          />
        </div>

        {[
          {
            key: "status", label: "Status", options: [
              { value: "ALL", label: "All statuses" },
              ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
            ]
          },
          {
            key: "priority", label: "Priority", options: [
              { value: "ALL", label: "All priorities" },
              ...["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => ({ value: p, label: p })),
            ]
          },
          {
            key: "type", label: "Type", options: [
              { value: "ALL", label: "All types" },
              ...Object.entries(TYPE_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
            ]
          },
          {
            key: "assigneeId", label: "Assignee", options: [
              { value: "ALL", label: "All members" },
              ...users.map((u) => ({ value: u.id, label: u.name })),
            ]
          },
        ].map((filter) => (
          <Select
            key={filter.key}
            value={filters[filter.key as keyof typeof filters]}
            onValueChange={(v) => setFilter(filter.key as keyof typeof filters, v)}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Last updated</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="dueDate">Due date</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-2 transition-colors", viewMode === "list" ? "bg-primary text-white" : "hover:bg-accent")}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-primary text-white" : "hover:bg-accent")}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Task count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{filteredAndSorted.length} tasks</span>
        {Object.values(filters).some((v) => v !== "ALL" && v !== "") && (
          <button onClick={() => { setFilter("search", ""); setFilter("status", "ALL"); setFilter("priority", "ALL"); setFilter("assigneeId", "ALL"); setFilter("moduleId", "ALL"); setFilter("type", "ALL"); }} className="text-primary hover:underline text-xs">
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-2">
          {filteredAndSorted.map((task, i) => {
            const TypeIcon = TYPE_ICONS[task.type] || CheckSquare;
            const moduleConfig = task.module ? MODULE_CONFIG[task.module.module] : null;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedTask(task)}
                className="group flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
              >
                <TypeIcon className={cn("h-4 w-4 shrink-0", TYPE_CONFIG[task.type]?.color)} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {moduleConfig && task.module && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(100,88,72,0.15)", color: "#7a6a58" }}>
                      {(() => { const Ic = moduleConfig?.icon; return Ic ? <Ic className="h-3 w-3" /> : null; })()}
                      {task.module.name}
                    </span>
                  )}

                  <Badge className={cn("text-[11px] border-0", STATUS_CONFIG[task.status]?.bg, STATUS_CONFIG[task.status]?.color)}>
                    {STATUS_CONFIG[task.status]?.label}
                  </Badge>

                  <div className={cn("flex items-center gap-1 text-[11px]", PRIORITY_CONFIG[task.priority]?.color)}>
                    <div className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_CONFIG[task.priority]?.dot)} />
                    {PRIORITY_CONFIG[task.priority]?.label}
                  </div>

                  {task.storyPoints && (
                    <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {task.storyPoints}pt
                    </span>
                  )}

                  {task.dueDate && (
                    <span className={cn("text-[11px]", new Date(task.dueDate) < new Date() ? "text-red-500" : "text-muted-foreground")}>
                      {formatDate(task.dueDate)}
                    </span>
                  )}

                  {task.assignee ? (
                    <UserAvatar src={task.assignee.avatar} className="h-6 w-6" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-dashed border-border" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSorted.map((task, i) => {
            const TypeIcon = TYPE_ICONS[task.type] || CheckSquare;
            const moduleConfig = task.module ? MODULE_CONFIG[task.module.module] : null;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className="cursor-pointer hover:border-primary/20 hover:shadow-md transition-all h-full"
                  onClick={() => setSelectedTask(task)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <TypeIcon className={cn("h-4 w-4", TYPE_CONFIG[task.type]?.color)} />
                      <span className={cn("text-[11px] font-medium", TYPE_CONFIG[task.type]?.color)}>
                        {TYPE_CONFIG[task.type]?.label}
                      </span>
                      <div className={cn("ml-auto h-1.5 w-1.5 rounded-full", PRIORITY_CONFIG[task.priority]?.dot)} />
                    </div>

                    <p className="text-sm font-medium line-clamp-2 leading-snug">{task.title}</p>

                    {moduleConfig && task.module && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded"
                        style={{ background: "rgba(100,88,72,0.15)", color: "#7a6a58" }}>
                        {(() => { const Ic = moduleConfig?.icon; return Ic ? <Ic className="h-3 w-3" /> : null; })()}
                        {task.module.name}
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge className={cn("text-[11px] border-0", STATUS_CONFIG[task.status]?.bg, STATUS_CONFIG[task.status]?.color)}>
                        {STATUS_CONFIG[task.status]?.label}
                      </Badge>
                      {task.assignee && (
                        <UserAvatar src={task.assignee.avatar} className="h-6 w-6" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {filteredAndSorted.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckSquare className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <h3 className="font-medium mb-1">No tasks found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new task</p>
        </div>
      )}

      <TaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={deleteTask}
        users={users}
        modules={modules}
        currentUserId={user?.id || ""}
      />

      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateTask}
        users={users}
        modules={modules}
      />
    </div>
  );
}
