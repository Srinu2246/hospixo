'use client';

import Link from 'next/link';
import { Bell, ChevronDown, LayoutGrid } from 'lucide-react';

import { LogoMark } from '@/components/common/brand/logo-mark';
import { MobileNavToggle } from '@/components/shell/mobile-nav';
import { headerChrome } from '@/config/shell/header-chrome';
import { routes } from '@/config/routes';
import { cn } from '@/lib/utils';
import { WorkspaceThemeToggle } from '@/components/shell/workspace-theme-toggle';

import styles from './workspace-mobile.module.css';

type WorkspaceMobileTopbarProps = Readonly<{
  eyebrow: string;
  title: string;
  navOpen: boolean;
  onMenuClick: () => void;
  homeHref?: string;
  className?: string;
}>;

export function WorkspaceMobileTopbar({
  eyebrow,
  title,
  navOpen,
  onMenuClick,
  homeHref = routes.dashboard.company,
  className,
}: WorkspaceMobileTopbarProps) {
  return (
    <header className={cn(styles.topbar, className)}>
      <Link href={homeHref} className={styles.brandLink} aria-label="Hospixo home">
        <span className={styles.brandMark}>
          <LogoMark />
        </span>
      </Link>

      <div className={styles.context}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <div className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          <ChevronDown className={styles.titleChevron} aria-hidden />
        </div>
      </div>

      <div className={styles.actions}>
        {headerChrome.showThemeToggle ? (
          <WorkspaceThemeToggle className={styles.themeToggle} />
        ) : null}
        {headerChrome.showNotifications ? (
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Notifications"
            disabled
            title="Notifications coming soon"
          >
            <Bell className={styles.icon} />
          </button>
        ) : null}
        {headerChrome.showExploreProducts ? (
          <Link
            href={routes.dashboard.settings}
            className={styles.primaryIconButton}
            aria-label="Explore products"
          >
            <LayoutGrid className={styles.icon} />
          </Link>
        ) : null}
        <MobileNavToggle open={navOpen} onClick={onMenuClick} className={styles.menuButton} />
      </div>
    </header>
  );
}
