import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'system';
type Tab = 'home' | 'favorites' | 'settings';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab })
    }),
    {
      name: 'podcast-app-settings',
    }
  )
);
