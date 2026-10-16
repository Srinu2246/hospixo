import { create } from 'zustand';

type UserRolesUiState = {
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
};

export const useUserRolesUiStore = create<UserRolesUiState>((set) => ({
  selectedUserId: null,
  setSelectedUserId: (userId) => set({ selectedUserId: userId }),
}));
