import { ReactNode } from 'react';
import { create } from 'zustand';

type SidebarState = {
  content: ReactNode | null;
  setSidebar: (content: ReactNode | null) => void;
};

export const useSidebar = create<SidebarState>((set) => ({
  content: null,
  setSidebar: (content) => set({ content }),
}));

// Keep SidebarProvider as a no-op wrapper for backward compatibility
export function SidebarProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
