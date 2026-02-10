import { create } from 'zustand';

export const useItemsStore = create((set) => ({
  items: [],
  selectedItem: null,
  selectedItemIds: [], 
  loading: false,
  
  setItems: (items) => set({ items }),
  
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  
  setSelectedItem: (item) => set({ selectedItem: item }),
  
  setSelectedItemIds: (ids) => set({ selectedItemIds: ids }), 
  
  toggleSelectItem: (id) =>
    set((state) => ({
      selectedItemIds: state.selectedItemIds.includes(id)
        ? state.selectedItemIds.filter((itemId) => itemId !== id)
        : [...state.selectedItemIds, id],
    })),
  
  setLoading: (loading) => set({ loading }),
}));