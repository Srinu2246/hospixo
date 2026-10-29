'use client';

import { useQueryClient, type QueryClient, type QueryKey } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { isApiServerFetchEnabled } from '@/services/api/fetchMode';

export type InvalidateAppQueriesOptions = {
  /** Prefix-match custom TanStack keys (e.g. `['organization', 'companies']`). */
  queryKeys?: QueryKey[];
  /** Prefix-match `useApiQuery` list/detail reads (`['api', path, …]`). */
  apiPaths?: string[];
};

/** Mark matching cached queries stale; active observers refetch immediately. */
export async function invalidateAppQueries(
  queryClient: QueryClient,
  options: InvalidateAppQueriesOptions,
): Promise<void> {
  const tasks: Array<Promise<void>> = [];

  for (const queryKey of options.queryKeys ?? []) {
    tasks.push(queryClient.invalidateQueries({ queryKey }) as Promise<void>);
  }

  for (const path of options.apiPaths ?? []) {
    tasks.push(queryClient.invalidateQueries({ queryKey: ['api', path] }) as Promise<void>);
  }

  await Promise.all(tasks);
}

type RouteRefresher = { refresh: () => void };

/** Re-run server components that passed `initialData` into list screens. */
export function refreshServerRouteData(router: RouteRefresher): void {
  if (isApiServerFetchEnabled()) {
    router.refresh();
  }
}

/** After a successful write: invalidate client cache and refresh RSC lists when in server-fetch mode. */
export async function syncAfterWrite(
  queryClient: QueryClient,
  router: RouteRefresher,
  options: InvalidateAppQueriesOptions,
): Promise<void> {
  await invalidateAppQueries(queryClient, options);
  refreshServerRouteData(router);
}

export function useQueryInvalidation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCallback(
    (options: InvalidateAppQueriesOptions) => syncAfterWrite(queryClient, router, options),
    [queryClient, router],
  );
}
