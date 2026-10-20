import { create } from 'zustand';

// One counter per kind of server data. After any change, call refresh('items', ...);
// every view that shows that data has the counter in its fetch effect and refetches,
// so components that keep their own copy of the data never go stale.
export const useRefreshStore = create((set) => ({
  versions: { items: 0, collections: 0, workspaces: 0, labels: 0 },

  refresh: (...keys) =>
    set((state) => {
      const versions = { ...state.versions };
      keys.forEach((key) => {
        versions[key] += 1;
      });
      return { versions };
    }),
}));

export const useRefreshVersion = (key) => useRefreshStore((state) => state.versions[key]);

export const useRefresh = () => useRefreshStore((state) => state.refresh);
