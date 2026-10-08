'use client';

import type { ReactNode } from 'react';

import { AccessShell } from '@/components/shell/access-shell';
import '@/features/pos/config/tokens.module.css';
import { usePosCompactChrome } from '@/features/pos/hooks/use-pos-compact-chrome';
import type { DashboardBootstrap } from '@/features/dashboard/types/dashboard-bootstrap';
import type { AccessLevel } from '@/lib/auth/access-level';

/**
 * AccessShell wrapper that hides centralized chrome on tablet/mobile POS.
 */
export function PosAccessShell({
  level,
  showOutlets,
  dashboardBootstrap,
  children,
}: Readonly<{
  level?: AccessLevel;
  showOutlets?: boolean;
  dashboardBootstrap?: DashboardBootstrap | null;
  children: ReactNode;
}>) {
  usePosCompactChrome(true);

  return (
    <AccessShell
      level={level}
      showOutlets={showOutlets}
      dashboardBootstrap={dashboardBootstrap}
      flushMain
    >
      {children}
    </AccessShell>
  );
}
