import { create } from "zustand";
import type { Sprint } from "@/types";

interface SprintState {
  sprints: Sprint[];
  activeSprint: Sprint | null;
  selectedSprint: Sprint | null;
  isLoading: boolean;
  setSprints: (sprints: Sprint[]) => void;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  removeSprint: (id: string) => void;
  setActiveSprint: (sprint: Sprint | null) => void;
  setSelectedSprint: (sprint: Sprint | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSprintStore = create<SprintState>()((set) => ({
  sprints: [],
  activeSprint: null,
  selectedSprint: null,
  isLoading: false,

  setSprints: (sprints) => {
    const active = sprints.find((s) => s.status === "ACTIVE") || null;
    set({ sprints, activeSprint: active });
  },
  addSprint: (sprint) =>
    set((state) => ({
      sprints: [sprint, ...state.sprints],
      activeSprint: sprint.status === "ACTIVE" ? sprint : state.activeSprint,
    })),
  updateSprint: (id, updates) =>
    set((state) => {
      const updatedSprints = state.sprints.map((s) => (s.id === id ? { ...s, ...updates } : s));
      const active = updatedSprints.find((s) => s.status === "ACTIVE") || null;
      return {
        sprints: updatedSprints,
        activeSprint: active,
        selectedSprint: state.selectedSprint?.id === id ? { ...state.selectedSprint, ...updates } : state.selectedSprint,
      };
    }),
  removeSprint: (id) =>
    set((state) => ({
      sprints: state.sprints.filter((s) => s.id !== id),
      selectedSprint: state.selectedSprint?.id === id ? null : state.selectedSprint,
    })),
  setActiveSprint: (sprint) => set({ activeSprint: sprint }),
  setSelectedSprint: (sprint) => set({ selectedSprint: sprint }),
  setLoading: (isLoading) => set({ isLoading }),
}));
