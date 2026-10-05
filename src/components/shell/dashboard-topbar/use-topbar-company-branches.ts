'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { DashboardOutlet } from '@/features/dashboard/types';
import { getCachedBranches, type BranchesCacheScope } from '@/lib/branches-cache';

export function useTopbarCompanyBranches(
  scope: BranchesCacheScope,
  enabled: boolean,
  allBranchesOption: DashboardOutlet,
): readonly DashboardOutlet[] | null {
  const { data: branchItems } = useQuery({
    queryKey: ['dashboard', 'topbar-branches', scope.orgId ?? '', scope.companyId ?? ''],
    queryFn: () => getCachedBranches({ scope }),
    enabled,
  });

  return useMemo(() => {
    if (!branchItems?.length) return null;
    return [
      allBranchesOption,
      ...branchItems.map((item) => ({
        id: String(item.id),
        name: String(item.name ?? 'Branch'),
      })),
    ];
  }, [allBranchesOption, branchItems]);
}
