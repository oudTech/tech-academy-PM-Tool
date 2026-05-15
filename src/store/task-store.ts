import { create } from "zustand";
import type { Task, TaskStatus } from "@/types";

interface TaskFilters {
  search: string;
  status: TaskStatus | "ALL";
  priority: string;
  assigneeId: string;
  moduleId: string;
  sprintId: string;
  type: string;
}

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  filters: TaskFilters;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setSelectedTask: (task: Task | null) => void;
  setLoading: (loading: boolean) => void;
  setFilter: (key: keyof TaskFilters, value: string) => void;
  resetFilters: () => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  getFilteredTasks: () => Task[];
}

const defaultFilters: TaskFilters = {
  search: "",
  status: "ALL",
  priority: "ALL",
  assigneeId: "ALL",
  moduleId: "ALL",
  sprintId: "ALL",
  type: "ALL",
};

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  selectedTask: null,
  isLoading: false,
  filters: defaultFilters,

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      selectedTask: state.selectedTask?.id === id ? { ...state.selectedTask, ...updates } : state.selectedTask,
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
    })),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setLoading: (isLoading) => set({ isLoading }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),

  moveTask: (taskId, newStatus) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    }));
    fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).catch(console.error);
  },

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.status !== "ALL" && task.status !== filters.status) return false;
      if (filters.priority !== "ALL" && task.priority !== filters.priority) return false;
      if (filters.assigneeId !== "ALL" && task.assigneeId !== filters.assigneeId) return false;
      if (filters.moduleId !== "ALL" && task.moduleId !== filters.moduleId) return false;
      if (filters.sprintId !== "ALL" && task.sprintId !== filters.sprintId) return false;
      if (filters.type !== "ALL" && task.type !== filters.type) return false;
      return true;
    });
  },
}));
