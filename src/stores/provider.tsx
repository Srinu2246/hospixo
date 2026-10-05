'use client';

import { type ReactNode, createContext, useState, useContext } from 'react';
import { type StoreApi, useStore } from 'zustand';
import { createAppStore, type AppStore } from './store';

export const AppStoreContext = createContext<StoreApi<AppStore> | null>(null);

export interface AppStoreProviderProps {
  children: ReactNode;
}

export const AppStoreProvider = ({ children }: AppStoreProviderProps) => {
  const [store] = useState(() => createAppStore());

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
};

export function useAppStore<T>(selector: (store: AppStore) => T): T {
  const storeContext = useContext(AppStoreContext);

  if (!storeContext) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }

  return useStore(storeContext, selector);
}
