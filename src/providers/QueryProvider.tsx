'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { isApiServerFetchEnabled } from '@/services/api/fetchMode';

type QueryProviderProps = {
  children: React.ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => {
    const serverFetch = isApiServerFetchEnabled();

    return new QueryClient({
      defaultOptions: {
        queries: {
          // Server-fetch mode: RSC supplies initialData; client GETs stay off until invalidated.
          staleTime: serverFetch ? Number.POSITIVE_INFINITY : 30 * 1000,
          gcTime: 5 * 60 * 1000,
          // Refetch when a screen mounts only if the cache is stale (e.g. after a mutation invalidation).
          refetchOnMount: true,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          retry: serverFetch ? false : 1,
        },
      },
    });
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
