import { create } from 'zustand';

const SELECTED_USER_STORAGE_KEY = 'hospixo_selected_user_id';

function getInitialSelectedUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(SELECTED_USER_STORAGE_KEY);
  } catch {
    return null;
  }
}

type UserRolesUiState = {
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
};

export const useUserRolesUiStore = create<UserRolesUiState>((set) => ({
  selectedUserId: getInitialSelectedUserId(),
  setSelectedUserId: (userId) => {
    if (typeof window !== 'undefined') {
      try {
        if (userId) {
          window.sessionStorage.setItem(SELECTED_USER_STORAGE_KEY, userId);
        } else {
          window.sessionStorage.removeItem(SELECTED_USER_STORAGE_KEY);
        }
      } catch {
        // Ignore session storage write errors (e.g. private browsing restrictions)
      }
    }
    set({ selectedUserId: userId });
  },
}));
