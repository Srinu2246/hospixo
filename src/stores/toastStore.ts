import { create } from 'zustand';

import type { ToastSeverity } from '@/components/shared/ui/Toast';

type ToastState = {
  message: string | null;
  severity: ToastSeverity;
  show: (message: string, severity?: ToastSeverity) => void;
  clear: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  severity: 'success',
  show: (message, severity = 'success') => set({ message, severity }),
  clear: () => set({ message: null }),
}));
