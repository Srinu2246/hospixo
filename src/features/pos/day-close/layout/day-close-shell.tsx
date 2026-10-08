'use client';

import { useCallback, useEffect, useState } from 'react';

import '@/features/pos/config/tokens.module.css';

import { PosOperationsSidebar } from '@/features/pos/screens/layout/pos-operations-sidebar';
import { DayCloseMobileHeader } from './day-close-mobile-header';

import styles from './day-close-shell.module.css';

const POS_COMPACT_CHROME_ATTR = 'data-pos-compact-chrome';
const COMPACT_MQ = '(max-width: 1023px)';

export function DayCloseShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

  useEffect(() => {
    const media = window.matchMedia(COMPACT_MQ);

    function syncCompactChrome() {
      if (media.matches) {
        document.documentElement.setAttribute(POS_COMPACT_CHROME_ATTR, 'true');
      } else {
        document.documentElement.removeAttribute(POS_COMPACT_CHROME_ATTR);
        setMenuOpen(false);
      }
    }

    syncCompactChrome();
    media.addEventListener('change', syncCompactChrome);
    return () => {
      media.removeEventListener('change', syncCompactChrome);
      document.documentElement.removeAttribute(POS_COMPACT_CHROME_ATTR);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenu();
    }

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, closeMenu]);

  return (
    <div className={styles.shell}>
      <DayCloseMobileHeader menuOpen={menuOpen} onMenuToggle={toggleMenu} />

      <div
        id="day-close-mobile-nav"
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <PosOperationsSidebar onNavigate={closeMenu} />
      </div>

      {menuOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation"
          onClick={closeMenu}
        />
      ) : null}

      {children}
    </div>
  );
}
