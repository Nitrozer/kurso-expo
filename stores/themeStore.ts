import { create } from 'zustand';
import { createStorage } from '../lib/storage';

const storage = createStorage('theme-prefs');

type ThemeMode = 'light' | 'dark';

type ThemeState = {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: (storage.getString('theme') as ThemeMode) ?? 'light',
  toggleTheme: () => {
    set((state) => {
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      storage.set('theme', newMode);
      return { mode: newMode };
    });
  },
  setTheme: (mode) => {
    storage.set('theme', mode);
    set({ mode });
  },
}));
