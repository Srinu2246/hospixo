'use client';

import { useState } from 'react';

import '@/features/pos/config/pos-tokens.css';

import { usePosChromeMode } from '@/context/pos-chrome';
import { usePosBreakpoint } from '@/features/pos/hooks/use-pos-breakpoint';
import type { PosOperationsSidebarVariant } from './pos-operations-sidebar';
import { PosOperationsHeader } from './pos-operations-header';
import { PosOperationsSidebar } from './pos-operations-sidebar';

import styles from './pos-operations-shell.module.css';

interface PosOperationsShellProps {
  children: React.ReactNode;
  /** Use `"dashboard"` only on the POS dashboard page. Defaults to operations nav. */
  sidebarVariant?: PosOperationsSidebarVariant;
  /**
   * Apply `--pos-page-bg` on this shell.
   * Only for: tables, dine-in, open-orders, due-payments, ready-list, online-orders.
   */
  withPageBg?: boolean;
}

/** Shell for POS operation screens. Use `sidebarVariant="dashboard"` on the dashboard only. */
export function PosOperationsShell({
  children,
  sidebarVariant = 'operations',
  withPageBg = false,
}: Readonly<PosOperationsShellProps>) {
  const chromeMode = usePosChromeMode();
  const breakpoint = usePosBreakpoint();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const rootClassName = [styles.embedded, withPageBg ? styles.pageBg : null]
    .filter(Boolean)
    .join(' ');

  // AccessShell supplies desktop chrome. On tablet it is hidden, so render
  // the centralized POS sidebar/header instead.
  if (chromeMode === 'embedded' && breakpoint !== 'tablet') {
    return <div className={rootClassName}>{children}</div>;
  }

  return (
    <div className={[styles.shell, withPageBg ? styles.pageBg : null].filter(Boolean).join(' ')}>
      <div
        id="pos-operations-sidebar"
        className={`${styles.sidebarWrap} ${mobileNavOpen ? styles.sidebarOpen : ''}`}
      >
        <PosOperationsSidebar variant={sidebarVariant} onNavigate={() => setMobileNavOpen(false)} />
      </div>

      {mobileNavOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <div className={styles.main}>
        <div className={styles.mobileBar}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            Menu
          </button>
        </div>
        <PosOperationsHeader
          menuOpen={mobileNavOpen}
          onMenuToggle={() => setMobileNavOpen((open) => !open)}
        />
        <div className={styles.contentWrap}>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  );
}
