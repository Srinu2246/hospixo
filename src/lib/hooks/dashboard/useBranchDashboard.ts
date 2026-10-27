'use client';

import { useMemo } from 'react';

import {
  parseBranchDashboardResponse,
  type BranchDashboardData,
} from '@/lib/schemas/dashboard/branchDashboardSchema';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

import { useDashboardApiQuery } from './useDashboardApiQuery';

export function useBranchDashboard(
  branchId: number | undefined,
  dateRange: { startDate?: string; endDate?: string },
) {
  const params = useMemo(
    () => ({
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
    }),
    [dateRange.endDate, dateRange.startDate],
  );

  const enabled = typeof branchId === 'number' && branchId > 0;
  const path = enabled ? ApiUrlsV1.dashboard.branchDetail(branchId) : '';

  return useDashboardApiQuery<BranchDashboardData>({
    path,
    params,
    enabled,
    parse: parseBranchDashboardResponse,
    missingContextError: enabled ? undefined : new Error('Branch id is required.'),
  });
}
