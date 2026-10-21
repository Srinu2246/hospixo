'use client';

import {
  useQuery as useTanStackQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

import { isApiClientFetchEnabled } from '@/services/api/fetchMode';

/**
 * App-wide useQuery. Applies NEXT_PUBLIC_API_SERVER_FETCH globally (like BFF headers):
 * when server-fetch mode is on, queries do not call the browser BFF.
 */
export function useQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<TData, TError> {
  const enabledOption = options.enabled;
  const enabled =
    isApiClientFetchEnabled() && (enabledOption === undefined ? true : Boolean(enabledOption));

  return useTanStackQuery({
    ...options,
    enabled,
  });
}
