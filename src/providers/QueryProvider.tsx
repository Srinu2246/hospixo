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
          // Server-fetch mode: keep SSR/initialData; do not hit the BFF from the browser.
          staleTime: serverFetch ? Number.POSITIVE_INFINITY : 60 * 1000,
          gcTime: 5 * 60 * 1000,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
          retry: serverFetch ? false : 1,
        },
      },
    });
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
