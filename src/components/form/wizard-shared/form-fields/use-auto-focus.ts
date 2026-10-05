'use client';

import { useEffect, type RefObject } from 'react';

const RETRY_MS = 150;

function tryFocus(element: HTMLElement | null | undefined): boolean {
  if (!element) {
    return false;
  }
  element.focus({ preventScroll: true });
  return document.activeElement === element;
}

/**
 * Focus after paint so App Router hydration, Strict Mode, and shell layout
 * do not steal focus before the wizard's first field is ready.
 */
export function useAutoFocus<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    let retryTimer: number | undefined;

    function runAttempt() {
      if (cancelled) {
        return;
      }
      if (tryFocus(ref.current)) {
        return;
      }
      retryTimer = window.setTimeout(() => {
        if (!cancelled) {
          tryFocus(ref.current);
        }
      }, RETRY_MS);
    }

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(runAttempt);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [enabled, ref]);
}
