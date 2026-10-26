'use client';

import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

import { isCaptainWorkspacePath } from '@/lib/helpers/posCaptainFlow';
import { screens } from '@/lib/theme/mui/breakpoints';

const BELOW_DESKTOP_QUERY = `(max-width: ${screens.desktop - 1}px)`;

function subscribeBelowDesktop(onStoreChange: () => void) {
  const media = window.matchMedia(BELOW_DESKTOP_QUERY);
  media.addEventListener('change', onStoreChange);
  return () => media.removeEventListener('change', onStoreChange);
}

function getBelowDesktopSnapshot() {
  return window.matchMedia(BELOW_DESKTOP_QUERY).matches;
}

function getBelowDesktopServerSnapshot() {
  return false;
}

/**
 * Captain-flow mobile/tablet shell (Figma): bottom nav, 15px padding, compact headers.
 * useSyncExternalStore keeps SSR and hydration aligned (server snapshot is always false).
 */
export function useCaptainCompactLayout(): boolean {
  const pathname = usePathname();
  const belowDesktop = useSyncExternalStore(
    subscribeBelowDesktop,
    getBelowDesktopSnapshot,
    getBelowDesktopServerSnapshot,
  );
  return isCaptainWorkspacePath(pathname) && belowDesktop;
}
