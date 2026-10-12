import { create } from 'zustand';
import type { SidebarContext, SidebarUserProfile } from '@/app/sidebar';
import { MOCK_DEFAULT_ROLE, MOCK_SIDEBAR_CONTEXT, MOCK_SIDEBAR_USER } from '@/lib/mocks/sidebar';

export type SidebarState = {
  isOpen: boolean;
  role: string;
  context: SidebarContext;
  user: SidebarUserProfile;
  toggleOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setRole: (role: string) => void;
  setContext: (context: Partial<SidebarContext>) => void;
  setUser: (user: Partial<SidebarUserProfile>) => void;
};

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  role: MOCK_DEFAULT_ROLE,
  context: MOCK_SIDEBAR_CONTEXT,
  user: MOCK_SIDEBAR_USER,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (isOpen) => set({ isOpen }),
  setRole: (role) => set({ role }),
  setContext: (context) => set((state) => ({ context: { ...state.context, ...context } })),
  setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
}));
