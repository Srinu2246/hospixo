'use client';

import { useSyncExternalStore } from 'react';

function subscribeHydrated(): () => void {
  return () => {};
}

function getHydratedSnapshot(): boolean {
  return true;
}

function getHydratedServerSnapshot(): boolean {
  return false;
}

/** True on the client after hydration; false during SSR and the first client pass. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeHydrated, getHydratedSnapshot, getHydratedServerSnapshot);
}
