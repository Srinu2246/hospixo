'use client';

import { useCallback, useEffect, useState } from 'react';

type UseMobileNavResult = Readonly<{
  open: boolean;
  openNav: () => void;
  closeNav: () => void;
  toggleNav: () => void;
}>;

/**
 * Shared open/close state for custom (non-shadcn) sidebars.
 * Locks body scroll and closes on Escape while open.
 */
export function useMobileNav(): UseMobileNavResult {
  const [open, setOpen] = useState(false);

  const openNav = useCallback(() => setOpen(true), []);
  const closeNav = useCallback(() => setOpen(false), []);
  const toggleNav = useCallback(() => setOpen((value) => !value), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeNav();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, closeNav]);

  return { open, openNav, closeNav, toggleNav };
}
