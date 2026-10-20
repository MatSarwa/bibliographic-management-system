import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
        });
      },

      setUserFromGoogle: (user, token) => {


        if (!user?.id || !user?.username || !token) {
          console.warn('setUserFromGoogle: invalid data', { user, token });
          return;
        }
        

        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
        });
      },

      setLoading: (loading) => set({ loading }),

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('auth-storage');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('REHYDRATE ERROR:', error);
        }
      },
    }
  )
);