'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import styles from './workspace-navigation-progress.module.css';

function isInternalNavigationLink(anchor: HTMLAnchorElement, pathname: string) {
  if (anchor.target === '_blank' || anchor.hasAttribute('download')) return false;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === pathname && url.search === window.location.search) return false;

  return true;
}

export function WorkspaceNavigationProgress() {
  const pathname = usePathname() ?? '';
  const [isNavigating, setIsNavigating] = useState(false);
  const [activePathname, setActivePathname] = useState(pathname);

  if (activePathname !== pathname) {
    setActivePathname(pathname);
    setIsNavigating(false);
  }

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavigationLink(anchor, pathname)) return;

      setIsNavigating(true);
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <div
      className={styles.wrap}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className={styles.bar}>
        <div className={styles.barFill} />
      </div>
    </div>
  );
}
