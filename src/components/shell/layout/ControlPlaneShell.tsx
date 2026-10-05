'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';

import AdminSidebar from '@/components/shell/sidebar/AdminSidebar';
import AdminTopbar from '@/components/shell/topbar/AdminTopbar';

import styles from './layout.module.css';

type ControlPlaneShellProps = Readonly<{
  children: ReactNode;
  userEmail?: string;
}>;

export default function ControlPlaneShell({ children, userEmail }: ControlPlaneShellProps) {
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = useCallback(() => setNavOpen(false), []);
  const toggleNav = useCallback(() => setNavOpen((open) => !open), []);

  useEffect(() => {
    if (!navOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeNav();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [navOpen, closeNav]);

  return (
    <div className={styles.shell}>
      {navOpen ? (
        <button
          type="button"
          className={[styles.overlay, styles.overlayVisible].join(' ')}
          onClick={closeNav}
          aria-label="Close navigation backdrop"
        />
      ) : null}
      <AdminSidebar open={navOpen} onClose={closeNav} />
      <div className={styles.main}>
        <AdminTopbar navOpen={navOpen} onMenuClick={toggleNav} userEmail={userEmail} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
