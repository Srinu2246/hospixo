'use client';

import { useMemo } from 'react';

import {
  parseOrganizationDashboardResponse,
  type OrganizationDashboardData,
} from '@/lib/schemas/dashboard/organizationDashboardSchema';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

import { useDashboardApiQuery } from './useDashboardApiQuery';

export type OrganizationDashboardQueryParams = {
  start_date?: string;
  end_date?: string;
  company_id?: number;
  search?: string;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
};

export function useOrganizationDashboard(
  organizationId: number | undefined,
  params?: OrganizationDashboardQueryParams,
) {
  const queryParams = useMemo(
    () => ({
      ...(params?.start_date ? { start_date: params.start_date } : {}),
      ...(params?.end_date ? { end_date: params.end_date } : {}),
      ...(params?.company_id != null ? { company_id: params.company_id } : {}),
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.sort_by ? { sort_by: params.sort_by } : {}),
      ...(params?.sort_order ? { sort_order: params.sort_order } : {}),
      ...(params?.page != null ? { page: params.page } : {}),
      ...(params?.page_size != null ? { page_size: params.page_size } : {}),
    }),
    [params],
  );

  const enabled = typeof organizationId === 'number' && organizationId > 0;
  const path = enabled ? ApiUrlsV1.dashboard.organizationDetail(organizationId) : '';

  return useDashboardApiQuery<OrganizationDashboardData>({
    path,
    params: queryParams,
    enabled,
    parse: parseOrganizationDashboardResponse,
    missingContextError: enabled ? undefined : new Error('Organization id is required.'),
  });
}
