'use client';

import type { ReactNode } from 'react';

import { AccessShell } from '@/components/shell/access-shell';
import type { DashboardBootstrap } from '@/features/dashboard/types/dashboard-bootstrap';

/** Authenticated workspace chrome (organisation / company / branch). */
export function PlatformShell({
  children,
  dashboardBootstrap = null,
}: Readonly<{
  children: ReactNode;
  dashboardBootstrap?: DashboardBootstrap | null;
}>) {
  return <AccessShell dashboardBootstrap={dashboardBootstrap}>{children}</AccessShell>;
}
