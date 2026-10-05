'use client';

import { useQuery } from '@tanstack/react-query';

import { loadDashboardOverview } from '@/services/dashboard';

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardQueryKeys.all, 'overview'] as const,
};

export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardQueryKeys.overview(),
    queryFn: loadDashboardOverview,
  });
}
