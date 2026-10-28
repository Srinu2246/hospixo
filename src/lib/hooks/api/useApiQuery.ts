'use client';

import { useState } from 'react';
import { type Query } from '@tanstack/react-query';

import { useQuery } from '@/lib/hooks/api/useQuery';
import { api } from '@/services/api/browserClient';
import type { QueryParams } from '@/services/api/types';

export type UseApiQueryOptions<T> = {
  path: string;
  params?: QueryParams;
  enabled?: boolean;
  initialData?: T;
  refetchInterval?: number | false | ((query: Query<T, unknown, T>) => number | false | undefined);
  retry?: boolean | number | ((failureCount: number, error: unknown) => boolean);
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean | 'always';
};

export function useApiQuery<T>({
  path,
  params,
  enabled = true,
  initialData,
  refetchInterval,
  retry,
  staleTime,
  refetchOnWindowFocus,
  refetchOnMount,
}: UseApiQueryOptions<T>) {
  const [initialDataUpdatedAt] = useState(() => Date.now());

  return useQuery({
    queryKey: ['api', path, params ?? {}],
    queryFn: ({ signal }) => api.get<T>(path, params, signal),
    enabled,
    initialData,
    initialDataUpdatedAt: initialData === undefined ? undefined : initialDataUpdatedAt,
    refetchInterval: refetchInterval as never,
    retry,
    staleTime,
    refetchOnWindowFocus,
    refetchOnMount,
  });
}
