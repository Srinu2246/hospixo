'use client';

import Link from 'next/link';

import { LogoMark } from '@/components/common/brand/logo-mark';
import { WorkspaceScopeControl } from '@/components/shell/workspace-scope';
import { WorkspaceMobileHeaderActions } from '@/components/shell/workspace-mobile/workspace-mobile-header-actions';
import { workspaceMobileChromeCopy } from '@/config/shell/workspace-mobile-chrome';
import { routes } from '@/config/routes';
import { cn } from '@/lib/utils';

import styles from './workspace-mobile.module.css';

type WorkspaceMobileTopbarProps = Readonly<{
  showOutlets?: boolean;
  navOpen: boolean;
  onMenuClick: () => void;
  homeHref?: string;
  className?: string;
}>;

export function WorkspaceMobileTopbar({
  showOutlets = true,
  navOpen,
  onMenuClick,
  homeHref = routes.dashboard.company,
  className,
}: WorkspaceMobileTopbarProps) {
  return (
    <header className={cn(styles.topbar, className)} data-access-chrome="mobile-topbar">
      <div className={styles.topbarInner}>
        <Link
          href={homeHref}
          className={styles.brandLink}
          aria-label={workspaceMobileChromeCopy.homeAriaLabel}
        >
          <span className={styles.brandMark}>
            <LogoMark />
          </span>
        </Link>

        <WorkspaceScopeControl showOutlets={showOutlets} />

        <WorkspaceMobileHeaderActions navOpen={navOpen} onMenuClick={onMenuClick} />
      </div>
    </header>
  );
}
