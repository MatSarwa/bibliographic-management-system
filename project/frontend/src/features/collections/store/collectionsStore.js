import { create } from 'zustand';

export const useCollectionsStore = create((set) => ({
  collections: [],
  selectedCollection: null,
  loading: false,

  setCollections: (collections) => set({ collections }),

  addCollection: (collection) =>
    set((state) => ({ collections: [...state.collections, collection] })),

  updateCollection: (id, updates) =>
    set((state) => ({
      collections: state.collections.map((col) =>
        col.id === id ? { ...col, ...updates } : col
      ),
    })),

  removeCollection: (id) =>
    set((state) => ({
      collections: state.collections.filter((col) => col.id !== id),
    })),

  setSelectedCollection: (collection) => set({ selectedCollection: collection }),

  setLoading: (loading) => set({ loading }),
}));