import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system', // 'light' | 'dark' | 'system'

      setTheme: (theme) => set({ theme }),

      toggleTheme: () => {
        const current = get().theme;
        const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
        set({ theme: next });
      },

      initTheme: () => {
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
          if (get().theme === 'system') {
            // Trigger re-render by setting the same value
            set({ theme: 'system' });
          }
        });
      },

      isDark: () => {
        const theme = get().theme;
        if (theme === 'dark') return true;
        if (theme === 'light') return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
