'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/services/api/browserClient';
import type { QueryParams } from '@/services/api/types';

export type UseApiQueryOptions<T> = {
  path: string;
  params?: QueryParams;
  enabled?: boolean;
  initialData?: T;
  refetchInterval?: number;
};

export function useApiQuery<T>({
  path,
  params,
  enabled = true,
  initialData,
  refetchInterval,
}: UseApiQueryOptions<T>) {
  const [initialDataUpdatedAt] = useState(() => Date.now());

  return useQuery({
    queryKey: ['api', path, params ?? {}],
    queryFn: ({ signal }) => api.get<T>(path, params, signal),
    enabled,
    initialData,
    initialDataUpdatedAt: initialData === undefined ? undefined : initialDataUpdatedAt,
    refetchInterval,
  });
}
