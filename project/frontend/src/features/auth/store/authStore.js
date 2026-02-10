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
        console.log('SET_AUTH called with:', { user, token: token?.substring(0, 20) });
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
        });
        console.log('AUTH SET COMPLETE');
      },

      setUserFromGoogle: (user, token) => {

        console.log('SET_USER_FROM_GOOGLE called with:', { user, token: token?.substring(0, 20) });

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
        console.log('LOGOUT called');
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
        console.log('REHYDRATE from localStorage:', state);
        if (error) {
          console.error('REHYDRATE ERROR:', error);
        }
      },
    }
  )
);