import { createContext, useContext, useState, ReactNode } from 'react';

const SidebarContext = createContext<{
  content: ReactNode | null;
  setSidebar: (content: ReactNode | null) => void;
}>({ content: null, setSidebar: () => {} });

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [content, setSidebar] = useState<ReactNode | null>(null);
  return (
    <SidebarContext.Provider value={{ content, setSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
