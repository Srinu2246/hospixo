'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { AccessShell } from '@/components/shell/access-shell';
import { isFullBleedDashboardPath } from '@/lib/dashboard/full-bleed-dashboard-paths';
import { isPlatformPosRoute, routes } from '@/config/routes';
import { isBranchPosFeaturePath } from '@/config/shell/flow-paths';
import { PosChromeProvider } from '@/context/pos-chrome';
import { PosOrderProvider } from '@/context/pos-order';
import { PosOrdersProvider } from '@/context/pos-orders-store';
import type { DashboardBootstrap } from '@/features/dashboard/types/dashboard-bootstrap';
import { PosAccessShell } from '@/features/pos/screens/layout/pos-access-shell';
import { isUsersRolesShellPath } from '@/features/user-roles/lib/paths';
import type { AccessLevel } from '@/lib/auth/access-level';

function isChefRoute(pathname: string) {
  return pathname === routes.dashboard.chef || pathname.startsWith(`${routes.dashboard.chef}/`);
}

function isDayCloseRoute(pathname: string) {
  const dayClose = routes.platform.pos.dayClose;
  return pathname === dayClose || pathname.startsWith(`${dayClose}/`);
}

function pathMatches(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

function usesLegacyPosPath(pathname: string) {
  return pathMatches(pathname, routes.dashboard.pos);
}

function isRoleFlowRoute(pathname: string) {
  return (
    pathMatches(pathname, routes.dashboard.captain) ||
    pathMatches(pathname, routes.dashboard.cashier)
  );
}

function needsPosOrderProvider(pathname: string) {
  return (
    usesLegacyPosPath(pathname) ||
    isRoleFlowRoute(pathname) ||
    isBranchPosFeaturePath(pathname) ||
    (isPlatformPosRoute(pathname) && !isDayCloseRoute(pathname))
  );
}

function resolveForcedAccessLevel(pathname: string): AccessLevel | undefined {
  if (pathMatches(pathname, routes.dashboard.captain)) return 'captain';
  if (pathMatches(pathname, routes.dashboard.cashier)) return 'counter';
  return undefined;
}

/** Authenticated workspace chrome (organisation / company / branch / POS). */
export function PlatformShell({
  children,
  dashboardBootstrap = null,
}: Readonly<{
  children: ReactNode;
  dashboardBootstrap?: DashboardBootstrap | null;
}>) {
  const pathname = usePathname() ?? '';
  const forcedLevel = resolveForcedAccessLevel(pathname);
  const isFullBleedDashboard = isFullBleedDashboardPath(pathname);
  const flushMain = isUsersRolesShellPath(pathname) || isFullBleedDashboard;

  let content = children;

  if (!isChefRoute(pathname)) {
    if (needsPosOrderProvider(pathname)) {
      content = (
        <PosOrderProvider>
          <PosChromeProvider mode="embedded">
            <PosAccessShell level={forcedLevel} dashboardBootstrap={dashboardBootstrap}>
              {content}
            </PosAccessShell>
          </PosChromeProvider>
        </PosOrderProvider>
      );
    } else {
      content = (
        <AccessShell
          dashboardBootstrap={dashboardBootstrap}
          flushMain={flushMain}
          contentPadding={!isDayCloseRoute(pathname) && !isFullBleedDashboard}
          level={forcedLevel}
        >
          {content}
        </AccessShell>
      );
    }
  }

  return <PosOrdersProvider>{content}</PosOrdersProvider>;
}
