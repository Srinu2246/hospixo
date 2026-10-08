'use client';

import { DashboardLeakageCard } from '@/features/dashboard/components/shared/dashboard-leakage-card';
import { branchDashboardCopy } from '@/features/dashboard/config/branch/dashboard';
import type { DashboardLeakageGroup } from '@/features/dashboard/types';

type BranchLeakageCardProps = Readonly<{
  kots: DashboardLeakageGroup;
  bills: DashboardLeakageGroup;
}>;

export function BranchLeakageCard({ kots, bills }: BranchLeakageCardProps) {
  const { title, groups } = branchDashboardCopy.leakage;

  return (
    <DashboardLeakageCard
      title={title}
      kotsTitle={groups.kots}
      billsTitle={groups.bills}
      kots={kots}
      bills={bills}
    />
  );
}
