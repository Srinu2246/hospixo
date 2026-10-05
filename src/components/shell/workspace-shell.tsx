import type { ReactNode } from 'react';

import { PlatformShell } from '@/components/shell/platform-shell';
import { loadDashboardShellData } from '@/features/dashboard/api/organisation-dashboard.server';

/** Workspace chrome with a single SSR dashboard bootstrap (branches + topbar outlets). */
export async function WorkspaceShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const dashboardBootstrap = await loadDashboardShellData();
  return <PlatformShell dashboardBootstrap={dashboardBootstrap}>{children}</PlatformShell>;
}
