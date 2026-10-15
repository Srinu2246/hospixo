'use client';

import { useSyncExternalStore } from 'react';

/**
 * Reads the AppShell footer mount node without setState-in-effect.
 * The footer is present for the life of the shell after first client paint.
 */
export function useAppShellFooterTarget(): HTMLElement | null {
  return useSyncExternalStore(
    () => () => {},
    () => document.getElementById('app-shell-footer'),
    () => null,
  );
}
