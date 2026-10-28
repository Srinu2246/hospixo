import type { Metadata } from 'next';

import { DashboardScreen } from '@/features/dashboard';
import type { DashboardLevel } from '@/features/dashboard/types/dashboard.types';

export const metadata: Metadata = {
  title: 'Dashboard | Hospixo',
  description: 'Multi-level statistics and operational analytics for Hospixo Hospital Management.',
};

interface ScopedDashboardRouteProps {
  params: Promise<{ scope: string }>;
}

function initialLevelFromScope(scopeSegment: string): DashboardLevel {
  const token = decodeURIComponent(scopeSegment).trim().toLowerCase();
  if (token === 'organization') return 'organization';
  if (token === 'company') return 'company';
  if (token === 'branch-manager' || token === 'branch') return 'branch';
  return 'branch';
}

export default async function ScopedDashboardRoute({
  params,
}: Readonly<ScopedDashboardRouteProps>) {
  const { scope } = await params;
  return <DashboardScreen initialLevel={initialLevelFromScope(scope)} scopeSegment={scope} />;
}
