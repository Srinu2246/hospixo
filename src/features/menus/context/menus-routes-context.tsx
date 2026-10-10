'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { getMenusRoutes, type MenusRoutes } from '../config/paths';

const MenusRoutesContext = createContext<MenusRoutes>(getMenusRoutes('company'));

export function MenusRoutesProvider({
  scope,
  children,
}: Readonly<{
  scope: 'company' | 'branch';
  children: ReactNode;
}>) {
  const routes = getMenusRoutes(scope);
  return <MenusRoutesContext.Provider value={routes}>{children}</MenusRoutesContext.Provider>;
}

export function useMenusRoutes(): MenusRoutes {
  return useContext(MenusRoutesContext);
}
