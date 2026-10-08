'use client';

import { useEffect } from 'react';

/**
 * On tablet/mobile (≤1023px), mark the document so AccessShell chrome
 * (sidebar + topbar) can be hidden for POS screens.
 */
export function usePosCompactChrome(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    const media = window.matchMedia('(max-width: 1023px)');

    function sync() {
      if (media.matches) {
        root.setAttribute('data-pos-compact-chrome', 'true');
      } else {
        root.removeAttribute('data-pos-compact-chrome');
      }
    }

    sync();
    media.addEventListener('change', sync);

    return () => {
      media.removeEventListener('change', sync);
      root.removeAttribute('data-pos-compact-chrome');
    };
  }, [enabled]);
}
