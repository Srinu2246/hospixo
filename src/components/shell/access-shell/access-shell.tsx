'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { AccessSidebar } from '@/components/shell/access-sidebar';
import { DashboardTopbar } from '@/components/shell/dashboard-topbar';
import { MobileNavOverlay } from '@/components/shell/mobile-nav';
import {
  WorkspaceMobileBottomNav,
  WorkspaceMobileTopbar,
  workspaceMobileStyles,
} from '@/components/shell/workspace-mobile';
import { WorkspaceNavigationProgress } from '@/components/shell/workspace-navigation-progress/workspace-navigation-progress';
import type { DashboardBootstrap } from '@/features/dashboard/types/dashboard-bootstrap';
import { useAuth } from '@/context/auth';
import { DashboardDataProvider } from '@/context/dashboard-data';
import { DashboardFilterProvider } from '@/context/dashboard-filter';
import { DbProvider } from '@/context/db-provider';
import { useMobileNav } from '@/hooks/use-mobile-nav';
import {
  resolveAccessLevel,
  resolveHierarchyHomePath,
  resolveSidebarLevel,
  type AccessLevel,
} from '@/lib/auth/access-level';
import { routes } from '@/config/routes';
import { isFullBleedDashboardPath } from '@/lib/dashboard/full-bleed-dashboard-paths';
import { cn } from '@/lib/utils';

import styles from './access-shell.module.css';

export { isFullBleedDashboardPath } from '@/lib/dashboard/full-bleed-dashboard-paths';

type AccessShellProps = Readonly<{
  /**
   * Force a sidebar level. Prefer omitting this so AccessSidebar can pick
   * org/company/branch nav from the current route + user ceiling.
   */
  level?: AccessLevel;
  showOutlets?: boolean;
  /**
   * When false, main content has no chrome padding so a feature shell
   * (e.g. DayCloseShell) can own responsive page padding.
   */
  contentPadding?: boolean;
  /** Drop default main padding — used by POS shells that own page padding. */
  flushMain?: boolean;
  dashboardBootstrap?: DashboardBootstrap | null;
  children: ReactNode;
}>;

/**
 * Mandatory dashboard chrome — AccessSidebar + topbar for every workspace page
 * except the full-screen chef display.
 */
export function AccessShell({
  level,
  showOutlets = true,
  contentPadding = true,
  flushMain = false,
  dashboardBootstrap = null,
  children,
}: AccessShellProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const { open: navOpen, closeNav, toggleNav } = useMobileNav();

  const userCeiling = user
    ? resolveAccessLevel({
        roles: user.roles ?? [],
        scope: user.scope ?? 'tenant',
        company_id: user.company_id ?? null,
        branch_id: user.branch_id ?? null,
      })
    : 'company';

  const sidebarLevel = level ?? resolveSidebarLevel(pathname, userCeiling, null);
  const mobileHomeHref = resolveHierarchyHomePath(userCeiling) ?? routes.dashboard.company;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(routes.auth.login);
    }
  }, [user, isLoading, router]);

  if (!isLoading && !user) return null;

  const disablePadding = flushMain || !contentPadding || isFullBleedDashboardPath(pathname);
  const mainPaddingClass = disablePadding ? undefined : styles.mainPadding;

  return (
    <div className={styles.root}>
      <MobileNavOverlay open={navOpen} onClose={closeNav} />
      <AccessSidebar level={level} open={navOpen} onClose={closeNav} />
      <div className={cn(styles.contentColumnInner, styles.contentColumn)}>
        <WorkspaceNavigationProgress />
        <DashboardFilterProvider>
          <DashboardDataProvider bootstrap={dashboardBootstrap}>
            <div className={workspaceMobileStyles.mobileOnly}>
              <WorkspaceMobileTopbar
                showOutlets={showOutlets}
                navOpen={navOpen}
                onMenuClick={toggleNav}
                homeHref={mobileHomeHref}
              />
            </div>
            <div className={workspaceMobileStyles.desktopOnly}>
              <DashboardTopbar
                showOutlets={showOutlets}
                navOpen={navOpen}
                onMenuClick={toggleNav}
              />
            </div>
            <main
              data-access-chrome="main"
              className={cn(
                styles.mainArea,
                styles.main,
                mainPaddingClass,
                styles.mainWithMobileNav,
              )}
            >
              <div className={styles.mainInner}>
                <DbProvider>{children}</DbProvider>
              </div>
            </main>
            <div className={workspaceMobileStyles.mobileOnly}>
              <WorkspaceMobileBottomNav level={sidebarLevel} />
            </div>
          </DashboardDataProvider>
        </DashboardFilterProvider>
      </div>
    </div>
  );
}
