'use client';

import { DashboardLeakageCard } from '@/features/dashboard/components/shared/dashboard-leakage-card';
import { companyLandingContent } from '@/features/dashboard/config/company';
import type { DashboardLeakageGroup } from '@/features/dashboard/types';

type LeakageTrackerCardProps = Readonly<{
  kots: DashboardLeakageGroup;
  bills: DashboardLeakageGroup;
}>;

export function LeakageTrackerCard({ kots, bills }: LeakageTrackerCardProps) {
  const { title, groups } = companyLandingContent.leakageTracker;

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
