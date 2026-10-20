import { create } from 'zustand';

import type { SidebarContext, SidebarUserProfile } from '@/app/sidebar';
import type { LoginUser } from '@/lib/schemas/login/loginFormSchema';
import {
  clearSidebarSession,
  readSidebarSession,
  writeSidebarSession,
  type SidebarSession,
} from '@/lib/auth/session';

export type SidebarState = {
  isOpen: boolean;
  role: string;
  context: SidebarContext;
  user: SidebarUserProfile;
  account: LoginUser | null;
  toggleOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setRole: (role: string) => void;
  setContext: (context: Partial<SidebarContext>) => void;
  setUser: (user: Partial<SidebarUserProfile>) => void;
  setSession: (session: SidebarSession) => void;
  clearSession: () => void;
  hydrateSession: () => void;
};

const emptyUser: SidebarUserProfile = { name: '', role: '' };

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isOpen: true,
  role: '',
  context: {},
  user: emptyUser,
  account: null,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (isOpen) => set({ isOpen }),
  setRole: (role) => set({ role }),
  setContext: (context) =>
    set((state) => {
      const nextContext = { ...state.context, ...context };
      if (state.role) {
        writeSidebarSession({
          role: state.role,
          context: nextContext,
          user: state.user,
          account: state.account ?? undefined,
        });
      }
      return { context: nextContext };
    }),
  setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
  setSession: (session) => {
    writeSidebarSession(session);
    set({
      role: session.role,
      context: session.context,
      user: session.user,
      account: session.account ?? null,
    });
  },
  clearSession: () => {
    clearSidebarSession();
    set({ role: '', context: {}, user: emptyUser, account: null });
  },
  hydrateSession: () => {
    if (get().role) return;
    const stored = readSidebarSession();
    if (!stored) return;
    set({
      role: stored.role,
      context: stored.context,
      user: stored.user,
      account: stored.account ?? null,
    });
  },
}));
