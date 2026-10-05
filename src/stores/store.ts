import { createStore } from 'zustand/vanilla';

export interface AppState {
  initialized: boolean;
}

export interface AppActions {
  setInitialized: (initialized: boolean) => void;
}

export type AppStore = AppState & AppActions;

export const createAppStore = (initState: Partial<AppState> = {}) => {
  return createStore<AppStore>()((set) => ({
    initialized: false,
    ...initState,
    setInitialized: (initialized) => set({ initialized }),
  }));
};
