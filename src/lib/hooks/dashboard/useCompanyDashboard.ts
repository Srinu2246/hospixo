'use client';

import { useMemo } from 'react';

import {
  parseCompanyDashboardResponse,
  type CompanyDashboardData,
} from '@/lib/schemas/dashboard/companyDashboardSchema';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

import { useDashboardApiQuery } from './useDashboardApiQuery';

export type CompanyDashboardQueryParams = {
  start_date?: string;
  end_date?: string;
  branch_id?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
  view?: 'top10';
};

export function useCompanyDashboard(
  companyId: number | undefined,
  params?: CompanyDashboardQueryParams,
) {
  const queryParams = useMemo(
    () => ({
      ...(params?.start_date ? { start_date: params.start_date } : {}),
      ...(params?.end_date ? { end_date: params.end_date } : {}),
      ...(params?.branch_id != null ? { branch_id: params.branch_id } : {}),
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.sort_by ? { sort_by: params.sort_by } : {}),
      ...(params?.sort_order ? { sort_order: params.sort_order } : {}),
      ...(params?.page != null ? { page: params.page } : {}),
      ...(params?.page_size != null ? { page_size: params.page_size } : {}),
      ...(params?.view ? { view: params.view } : {}),
    }),
    [params],
  );

  const enabled = typeof companyId === 'number' && companyId > 0;
  const path = enabled ? ApiUrlsV1.dashboard.companyDetail(companyId) : '';

  return useDashboardApiQuery<CompanyDashboardData>({
    path,
    params: queryParams,
    enabled,
    parse: parseCompanyDashboardResponse,
    missingContextError: enabled ? undefined : new Error('Company id is required.'),
  });
}
