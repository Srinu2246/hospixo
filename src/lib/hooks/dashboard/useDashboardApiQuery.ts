'use client';

import { useMemo } from 'react';

import { useApiQuery } from '@/lib/hooks/api/useApiQuery';
import type { QueryParams } from '@/services/api/types';

/**
 * Dashboard data fetch — same shape as reports `useBranchReportQuery`:
 * BFF via useApiQuery, Zod parse in a memo, parse errors surfaced as query errors.
 */
export function useDashboardApiQuery<TData>(options: {
  path: string;
  params?: QueryParams;
  enabled?: boolean;
  parse: (payload: unknown) => TData;
  missingContextError?: Error;
}) {
  const { path, params, enabled = true, parse, missingContextError } = options;
  const canFetch = enabled && Boolean(path);

  const query = useApiQuery<unknown>({
    path: canFetch ? path : '',
    params,
    enabled: canFetch,
  });

  const parseResult = useMemo(() => {
    if (!query.data) {
      return { data: undefined as TData | undefined, parseError: undefined as Error | undefined };
    }
    try {
      return { data: parse(query.data), parseError: undefined };
    } catch (error) {
      return {
        data: undefined,
        parseError: error instanceof Error ? error : new Error('Invalid dashboard response'),
      };
    }
  }, [query.data, parse]);

  const { data, parseError } = parseResult;

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: !canFetch && missingContextError != null ? true : query.isError || Boolean(parseError),
    error: !canFetch
      ? missingContextError
      : (parseError ?? (query.error instanceof Error ? query.error : undefined)),
    refetch: query.refetch,
  };
}
