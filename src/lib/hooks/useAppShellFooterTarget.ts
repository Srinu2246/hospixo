'use client';

import { useLayoutEffect, useState } from 'react';

const FOOTER_ID = 'app-shell-footer';

/**
 * Returns the AppShell sticky footer mount node after layout (sibling of `<main>`).
 */
export function useAppShellFooterTarget(): HTMLElement | null {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const read = () => document.getElementById(FOOTER_ID);

    const node = read();
    if (node) {
      setTarget(node);
      return;
    }

    const frame = requestAnimationFrame(() => {
      setTarget(read());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return target;
}
