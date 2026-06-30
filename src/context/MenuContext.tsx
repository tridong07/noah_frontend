"use client";
import { createContext, useContext, useState, useEffect } from 'react';

interface MenuContextType {
  breadcrumbs: string[];
  setBreadcrumbs: (val: string[]) => void;
  resetBreadcrumbs: () => void;
}

const MenuContext = createContext<MenuContextType>({
  breadcrumbs: [],
  setBreadcrumbs: () => {},
  resetBreadcrumbs: () => {}
});

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('sap_breadcrumbs');
    if (saved) setBreadcrumbs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('sap_breadcrumbs', JSON.stringify(breadcrumbs));
  }, [breadcrumbs]);

  const resetBreadcrumbs = () => setBreadcrumbs([]);

  return (
    <MenuContext.Provider value={{ breadcrumbs, setBreadcrumbs, resetBreadcrumbs }}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenuContext = () => useContext(MenuContext);