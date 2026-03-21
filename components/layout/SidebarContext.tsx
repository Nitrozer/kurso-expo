import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

const SidebarContext = createContext<{
  content: ReactNode | null;
  setSidebar: (content: ReactNode | null) => void;
}>({ content: null, setSidebar: () => {} });

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode | null>(null);

  const setSidebar = useCallback((newContent: ReactNode | null) => {
    setContent(newContent);
  }, []);

  const value = useMemo(() => ({ content, setSidebar }), [content, setSidebar]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
