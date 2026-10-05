'use client';

import { useCallback, useState } from 'react';

export function useWorkspaceMobileNav() {
  const [open, setOpen] = useState(false);

  const closeNav = useCallback(() => setOpen(false), []);
  const toggleNav = useCallback(() => setOpen((current) => !current), []);

  return { open, closeNav, toggleNav };
}
