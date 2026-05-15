"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, DragOverlay, closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { Filter, Search, SlidersHorizontal, LayoutGrid, Plus } from "lucide-react";
import { KanbanColumn } from "@/components/board/kanban-column";
import { TaskCard } from "@/components/board/task-card";
import { TaskModal } from "@/components/board/task-modal";
import { CreateTaskModal } from "@/components/board/create-task-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskStore } from "@/store/task-store";
import { useAuthStore } from "@/store/auth-store";
import { useTasks } from "@/hooks/use-tasks";
import { useRealtimeBoard } from "@/hooks/use-realtime-board";
import { cn, STATUS_CONFIG } from "@/lib/utils";
import type { Task, TaskStatus, User, ProjectModule } from "@/types";

const COLUMNS: Array<{ id: TaskStatus; title: string; color: string }> = [
  { id: "BACKLOG", title: "Backlog", color: "#6b7280" },
  { id: "TODO", title: "Todo", color: "#8b5cf6" },
  { id: "IN_PROGRESS", title: "In Progress", color: "#3b82f6" },
  { id: "REVIEW", title: "Review", color: "#f59e0b" },
  { id: "TESTING", title: "Testing", color: "#14b8a6" },
  { id: "DONE", title: "Done", color: "#10b981" },
];

export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<ProjectModule[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>("BACKLOG");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const { user } = useAuthStore();
  const { createTask, updateTask, deleteTask } = useTasks();

  useRealtimeBoard({
    projectId: "clproject001",
    onTaskCreated: (task) => setTasks((prev) => [task, ...prev]),
    onTaskUpdated: (task) => setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t))),
    onTaskDeleted: (taskId) => setTasks((prev) => prev.filter((t) => t.id !== taskId)),
    onTaskMoved: (taskId, toStatus) =>
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: toStatus as TaskStatus } : t))),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/tasks?projectId=clproject001").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/modules?projectId=clproject001").then((r) => r.json()),
    ]).then(([tasksData, usersData, modulesData]) => {
      setTasks(tasksData.tasks || []);
      setUsers(usersData.users || []);
      setModules(modulesData.modules || []);
    }).finally(() => setIsLoading(false));
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterAssignee !== "ALL" && task.assigneeId !== filterAssignee) return false;
    if (filterPriority !== "ALL" && task.priority !== filterPriority) return false;
    return true;
  });

  const getColumnTasks = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    let newStatus = activeTask.status;

    if (over.data.current?.type === "column") {
      newStatus = over.data.current.status as TaskStatus;
    } else if (over.data.current?.type === "task") {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus !== activeTask.status) {
      setTasks((prev) =>
        prev.map((t) => t.id === active.id ? { ...t, status: newStatus } : t)
      );
      await fetch(`/api/tasks/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }).catch(console.error);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
  };

  const handleTaskUpdate = async (id: string, updates: Partial<Task>): Promise<Task | null> => {
    const updated = await updateTask(id, updates);
    if (updated) {
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));
    }
    return updated;
  };

  const handleTaskDelete = async (id: string): Promise<boolean> => {
    const success = await deleteTask(id);
    if (success) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
    return success;
  };

  const handleCreateTask = async (data: Partial<Task>): Promise<Task | null> => {
    const created = await createTask(data);
    if (created) {
      setTasks((prev) => [created, ...prev]);
    }
    return created;
  };

  const handleAddTask = (status: TaskStatus) => {
    setCreateDefaultStatus(status);
    setCreateModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Kanban Board</h1>
          <p className="text-muted-foreground text-sm">Drag and drop tasks across columns</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} size="sm" className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative w-full sm:flex-1 sm:min-w-48 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 h-9"
          />
        </div>

        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All members</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-36 h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All priorities</SelectItem>
            {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5 ml-auto text-sm text-muted-foreground">
          <LayoutGrid className="h-4 w-4" />
          <span>{filteredTasks.length} tasks</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={getColumnTasks(col.id)}
                color={col.color}
                onTaskClick={setSelectedTask}
                onAddTask={handleAddTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="rotate-2 scale-105 shadow-2xl opacity-90">
                <TaskCard task={activeTask} onClick={() => {}} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Detail Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
        users={users}
        modules={modules}
        currentUserId={user?.id || ""}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateTask}
        defaultStatus={createDefaultStatus}
        users={users}
        modules={modules}
      />
    </div>
  );
}
