'use client';

import { useState } from 'react';

import '@/features/pos/config/pos-tokens.css';

import { usePosChromeMode } from '@/context/pos-chrome';
import { usePosBreakpoint } from '@/features/pos/hooks/use-pos-breakpoint';
import { PosOperationsHeader } from './pos-operations-header';
import { PosOperationsSidebar } from './pos-operations-sidebar';

import styles from './pos-flow-shell.module.css';

interface PosFlowShellProps {
  /** Match an id from `posFlowNavItems` / `posFlowFooterNav` in config. */
  activeNavId: string;
  /** Stretch main content edge-to-edge beside the sidebar (no content-max centering). */
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Common shell for Dine-In flow screens (screen 2+).
 * Import this layout and pass the active nav id from config.
 */
export function PosFlowShell({ fullWidth = false, children }: Readonly<PosFlowShellProps>) {
  const chromeMode = usePosChromeMode();
  const breakpoint = usePosBreakpoint();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  // AccessShell supplies desktop chrome. On tablet it is hidden, so render
  // the centralized POS sidebar/header instead.
  if (chromeMode === 'embedded' && breakpoint !== 'tablet') {
    return (
      <div
        className={`${styles.embedded} ${styles.content} ${fullWidth ? styles.contentFullWidth : ''}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={`${styles.sidebarWrap} ${mobileNavOpen ? styles.sidebarOpen : ''}`}>
        <PosOperationsSidebar onNavigate={closeMobileNav} />
      </div>

      {mobileNavOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation"
          onClick={closeMobileNav}
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
        <div className={styles.tabletHeader}>
          <PosOperationsHeader
            menuOpen={mobileNavOpen}
            onMenuToggle={() => setMobileNavOpen((open) => !open)}
          />
        </div>
        <div className={`${styles.content} ${fullWidth ? styles.contentFullWidth : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
