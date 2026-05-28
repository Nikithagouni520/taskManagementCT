import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.data, token: data.data.token });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
        return data.data;
      },

      register: async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        set({ user: data.data, token: data.data.token });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
        return data.data;
      },

      logout: () => {
        set({ user: null, token: null });
        delete api.defaults.headers.common['Authorization'];
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false });
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          const { data } = await api.get('/auth/me');
          set({ user: { ...data.data, token }, isLoading: false });
        } catch (error) {
          set({ user: null, token: null, isLoading: false });
          delete api.defaults.headers.common['Authorization'];
        }
      },

      updateSettings: async (settings) => {
        const { data } = await api.put('/auth/settings', settings);
        set({ user: { ...get().user, settings: data.data.settings } });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
