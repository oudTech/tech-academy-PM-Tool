"use client";

import { useCallback } from "react";
import { useTaskStore } from "@/store/task-store";
import { useToast } from "@/hooks/use-toast";
import type { Task, TaskStatus } from "@/types";

export function useTasks() {
  const store = useTaskStore();
  const { toast } = useToast();

  const fetchTasks = useCallback(async (params?: Record<string, string>) => {
    store.setLoading(true);
    try {
      const query = new URLSearchParams(params || {}).toString();
      const res = await fetch(`/api/tasks${query ? `?${query}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      store.setTasks(data.tasks);
      return data.tasks as Task[];
    } catch (error) {
      toast({ title: "Error", description: "Failed to load tasks", variant: "destructive" });
      return [];
    } finally {
      store.setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const data = await res.json();
      store.addTask(data.task);
      toast({ title: "Task created", description: `"${data.task.title}" was created successfully` });
      return data.task as Task;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create task";
      toast({ title: "Error", description: msg, variant: "destructive" });
      return null;
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    store.updateTask(id, updates);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const data = await res.json();
      store.updateTask(id, data.task);
      return data.task as Task;
    } catch (error) {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
      return null;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      store.removeTask(id);
      toast({ title: "Task deleted", description: "Task was deleted successfully" });
      return true;
    } catch {
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
      return false;
    }
  }, []);

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    store.moveTask(taskId, newStatus);
  }, []);

  return {
    tasks: store.tasks,
    selectedTask: store.selectedTask,
    isLoading: store.isLoading,
    filters: store.filters,
    filteredTasks: store.getFilteredTasks(),
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    setSelectedTask: store.setSelectedTask,
    setFilter: store.setFilter,
    resetFilters: store.resetFilters,
  };
}
