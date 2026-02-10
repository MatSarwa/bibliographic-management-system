import { create } from 'zustand';

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  selectedWorkspace: null,
  loading: false,

  setWorkspaces: (workspaces) => set({ workspaces }),
  
  addWorkspace: (workspace) =>
    set((state) => ({
      workspaces: [...state.workspaces, workspace],
    })),

  updateWorkspace: (id, updates) =>
    set((state) => ({
      workspaces: state.workspaces.map((ws) =>
        ws.id === id ? { ...ws, ...updates } : ws
      ),
    })),

  removeWorkspace: (id) =>
    set((state) => ({
      workspaces: state.workspaces.filter((ws) => ws.id !== id),
      selectedWorkspace: state.selectedWorkspace?.id === id ? null : state.selectedWorkspace,
    })),

  setSelectedWorkspace: (workspace) => set({ selectedWorkspace: workspace }),
  
  setLoading: (loading) => set({ loading }),
}));