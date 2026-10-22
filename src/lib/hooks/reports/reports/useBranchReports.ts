'use client';

import { useMemo } from 'react';

import { accountFromCurrentUser } from '@/lib/schemas/login/loginFormSchema';
import {
  parseReportsOrdersSummaryResponse,
  parseReportsOverviewResponse,
  parseReportsSalesResponse,
  parseReportsPaymentsResponse,
  parseReportsSessionsResponse,
} from '@/lib/schemas/reports/reports/branchReports';
import { useApiQuery } from '@/lib/hooks/api/useApiQuery';
import { useSidebarStore } from '@/stores/sidebarStore';
import { formatIsoDate } from '@/lib/helpers/reportsOverview';
import ApiUrlsV1, {
  branchReportsOrdersSummaryPath,
  branchReportsOverviewPath,
  branchReportsPaymentsPath,
  branchReportsSalesPath,
  branchReportsSessionsPath,
} from '@/services/api/ApiUrlsV1';

const MISSING_BRANCH_ERROR = 'Select a branch to load branch reports.';

function resolveBranchId(
  mePayload: unknown,
  contextBranchId: string | number | null | undefined,
  accountBranchId: number | null | undefined,
): string | undefined {
  if (contextBranchId != null && String(contextBranchId).trim() !== '') {
    return String(contextBranchId);
  }

  if (accountBranchId != null) {
    return String(accountBranchId);
  }

  if (!mePayload) return undefined;
  try {
    const branchId = accountFromCurrentUser(mePayload).branch_id;
    return branchId == null ? undefined : String(branchId);
  } catch {
    return undefined;
  }
}

export function useReportsBranchId() {
  const contextBranchId = useSidebarStore((state) => state.context.branchId);
  const accountBranchId = useSidebarStore((state) => state.account?.branch_id ?? undefined);

  const meQuery = useApiQuery<unknown>({
    path: ApiUrlsV1.auth.me,
  });

  const branchId = useMemo(
    () => resolveBranchId(meQuery.data, contextBranchId, accountBranchId),
    [meQuery.data, contextBranchId, accountBranchId],
  );

  const missingBranch = !meQuery.isLoading && !branchId;

  return {
    branchId,
    isMeLoading: meQuery.isLoading,
    isMeError: meQuery.isError,
    meError: meQuery.error,
    missingBranch,
  };
}

export type ReportsDateRangeQueryParams = Readonly<{
  dateFrom: Date;
  dateTo: Date;
  compareFrom: string;
  compareTo: string;
}>;

function buildDateRangeQueryParams(params: ReportsDateRangeQueryParams) {
  return {
    date_from: formatIsoDate(params.dateFrom),
    date_to: formatIsoDate(params.dateTo),
    compare_from: params.compareFrom,
    compare_to: params.compareTo,
  };
}

function useBranchReportQuery<TData>(
  getPath: (branchId: string) => string,
  queryParams: Record<string, string | number>,
  parse: (payload: unknown) => TData,
) {
  const { branchId, isMeLoading, isMeError, meError, missingBranch } = useReportsBranchId();

  const path = branchId ? getPath(branchId) : '';

  const reportQuery = useApiQuery<unknown>({
    path,
    params: queryParams,
    enabled: Boolean(branchId),
  });

  const parseResult = useMemo(() => {
    if (!reportQuery.data)
      return { data: undefined as TData | undefined, parseError: undefined as Error | undefined };
    try {
      return { data: parse(reportQuery.data), parseError: undefined };
    } catch (error) {
      return {
        data: undefined,
        parseError: error instanceof Error ? error : new Error('Invalid report response'),
      };
    }
  }, [reportQuery.data, parse]);

  const { data, parseError } = parseResult;

  return {
    branchId,
    data,
    isLoading: isMeLoading || reportQuery.isLoading,
    isError: missingBranch || isMeError || reportQuery.isError || Boolean(parseError),
    error: missingBranch
      ? new Error(MISSING_BRANCH_ERROR)
      : (parseError ?? reportQuery.error ?? meError),
    refetch: reportQuery.refetch,
  };
}

export type ReportsOverviewQueryParams = ReportsDateRangeQueryParams;

export function useReportsOverview(params: ReportsOverviewQueryParams) {
  const queryParams = useMemo(() => buildDateRangeQueryParams(params), [params]);
  return useBranchReportQuery(branchReportsOverviewPath, queryParams, parseReportsOverviewResponse);
}

export type ReportsSalesQueryParams = ReportsDateRangeQueryParams &
  Readonly<{
    orderType?: string;
    sessionId?: number;
  }>;

export function useReportsSales(params: ReportsSalesQueryParams) {
  const queryParams = useMemo(() => {
    const base: Record<string, string | number> = buildDateRangeQueryParams(params);
    if (params.orderType?.trim()) {
      base.order_type = params.orderType.trim();
    }
    if (params.sessionId != null) {
      base.session_id = params.sessionId;
    }
    return base;
  }, [params]);

  return useBranchReportQuery(branchReportsSalesPath, queryParams, parseReportsSalesResponse);
}

export type ReportsOrdersSummaryQueryParams = ReportsDateRangeQueryParams;

export function useReportsOrdersSummary(params: ReportsOrdersSummaryQueryParams) {
  const queryParams = useMemo(() => buildDateRangeQueryParams(params), [params]);
  return useBranchReportQuery(
    branchReportsOrdersSummaryPath,
    queryParams,
    parseReportsOrdersSummaryResponse,
  );
}

export type ReportsSessionsQueryParams = ReportsDateRangeQueryParams &
  Readonly<{
    /** Top/low item rows per session (API default 5, max 20). */
    limit?: number;
  }>;

export function useReportsSessions(params: ReportsSessionsQueryParams) {
  const queryParams = useMemo(() => {
    const base: Record<string, string | number> = buildDateRangeQueryParams(params);
    const limit = params.limit ?? 5;
    base.limit = Math.min(20, Math.max(1, limit));
    return base;
  }, [params]);

  return useBranchReportQuery(branchReportsSessionsPath, queryParams, parseReportsSessionsResponse);
}

export type ReportsPaymentsQueryParams = ReportsDateRangeQueryParams;

export function useReportsPayments(params: ReportsPaymentsQueryParams) {
  const queryParams = useMemo(() => buildDateRangeQueryParams(params), [params]);
  return useBranchReportQuery(branchReportsPaymentsPath, queryParams, parseReportsPaymentsResponse);
}
