'use client';

import { useEffect } from 'react';

import '@/features/pos/config/pos-tokens.css';

import type { PosDashboardMobileNavId } from '@/features/pos/config/nav-dashboard-mobile';
import type { PosMobileNavId } from '@/features/pos/config/nav-mobile';
import { PosDashboardBottomNav } from './pos-dashboard-bottom-nav';
import { PosMobileBottomNav } from './pos-mobile-bottom-nav';

import styles from './pos-mobile-shell.module.css';

const POS_COMPACT_CHROME_ATTR = 'data-pos-compact-chrome';

interface PosMobileShellProps {
  activeNavId?: PosMobileNavId;
  dashboardActiveNavId?: PosDashboardMobileNavId;
  bottomNavVariant?: 'operations' | 'dashboard';
  hasStickyBar?: boolean;
  /** @deprecated Layout uses PosCompactPage; kept for call-site compatibility. */
  withPageBg?: boolean;
  /** Hide bottom nav when false. */
  showBottomNav?: boolean;
  children: React.ReactNode;
}

export function PosMobileShell({
  activeNavId = 'tables',
  dashboardActiveNavId = 'dashboard',
  bottomNavVariant = 'operations',
  hasStickyBar = false,
  withPageBg: _withPageBg = false,
  showBottomNav = true,
  children,
}: Readonly<PosMobileShellProps>) {
  useEffect(() => {
    document.documentElement.setAttribute(POS_COMPACT_CHROME_ATTR, 'true');
    return () => {
      document.documentElement.removeAttribute(POS_COMPACT_CHROME_ATTR);
    };
  }, []);

  return (
    <div className={styles.shell}>
      <div
        className={[
          styles.content,
          hasStickyBar ? styles.contentWithBar : null,
          !showBottomNav ? styles.contentNoNav : null,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
      {showBottomNav && bottomNavVariant === 'dashboard' ? (
        <PosDashboardBottomNav activeNavId={dashboardActiveNavId} />
      ) : null}
      {showBottomNav && bottomNavVariant === 'operations' ? (
        <PosMobileBottomNav activeNavId={activeNavId} />
      ) : null}
    </div>
  );
}
