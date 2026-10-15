'use client';

import Link from 'next/link';
import { Bell, LayoutGrid } from 'lucide-react';

import { MobileNavToggle } from '@/components/shell/mobile-nav';
import { WorkspaceThemeToggle } from '@/components/shell/workspace-theme-toggle';
import { headerChrome } from '@/config/shell/header-chrome';
import { workspaceMobileChromeCopy } from '@/config/shell/workspace-mobile-chrome';
import { routes } from '@/config/routes';
import { cn } from '@/lib/utils';

import styles from './workspace-mobile.module.css';

type WorkspaceMobileHeaderActionsProps = Readonly<{
  navOpen: boolean;
  onMenuClick: () => void;
  className?: string;
}>;

export function WorkspaceMobileHeaderActions({
  navOpen,
  onMenuClick,
  className,
}: WorkspaceMobileHeaderActionsProps) {
  return (
    <div className={cn(styles.actions, className)}>
      {headerChrome.showThemeToggle ? (
        <WorkspaceThemeToggle className={styles.themeToggle} />
      ) : null}
      {headerChrome.showNotifications ? (
        <button
          type="button"
          className={styles.iconButton}
          aria-label={workspaceMobileChromeCopy.notificationsLabel}
          disabled
          title={workspaceMobileChromeCopy.notificationsTitle}
        >
          <Bell className={styles.icon} />
        </button>
      ) : null}
      {headerChrome.showExploreProducts ? (
        <Link
          href={routes.dashboard.settings}
          className={styles.primaryIconButton}
          aria-label={workspaceMobileChromeCopy.exploreProductsLabel}
        >
          <LayoutGrid className={styles.icon} />
        </Link>
      ) : null}
      <MobileNavToggle open={navOpen} onClick={onMenuClick} className={styles.menuButton} />
    </div>
  );
}
