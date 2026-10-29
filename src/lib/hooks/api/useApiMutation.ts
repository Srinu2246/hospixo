'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { syncAfterWrite } from '@/lib/hooks/api/queryCacheSync';
import { api } from '@/services/api/browserClient';
import type { HttpMethod } from '@/services/api/types';
import type { QueryKey } from '@tanstack/react-query';

type MutationMethod = Exclude<HttpMethod, 'GET'>;

export type UseApiMutationOptions = {
  path: string;
  method?: MutationMethod;
  /** Prefix-invalidates `useApiQuery` reads for this path. */
  invalidatePath?: string;
  /** Additional cache prefixes to mark stale after success. */
  invalidateQueryKeys?: QueryKey[];
};

export function useApiMutation<TData, TVariables = unknown>({
  path,
  method = 'POST',
  invalidatePath,
  invalidateQueryKeys,
}: UseApiMutationOptions) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (variables: TVariables) => mutate<TData, TVariables>(method, path, variables),
    onSuccess: async () => {
      await syncAfterWrite(queryClient, router, {
        apiPaths: [invalidatePath ?? path],
        queryKeys: invalidateQueryKeys,
      });
    },
  });
}

function mutate<TData, TVariables>(
  method: MutationMethod,
  path: string,
  variables: TVariables,
): Promise<TData> {
  if (method === 'PUT') return api.put<TData>(path, variables);
  if (method === 'PATCH') return api.patch<TData>(path, variables);
  if (method === 'DELETE') return api.delete<TData>(path);
  return api.post<TData>(path, variables);
}
