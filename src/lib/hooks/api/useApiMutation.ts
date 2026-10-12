'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/services/api/browserClient';
import type { HttpMethod } from '@/services/api/types';

type MutationMethod = Exclude<HttpMethod, 'GET'>;

export type UseApiMutationOptions = {
  path: string;
  method?: MutationMethod;
  invalidatePath?: string;
};

export function useApiMutation<TData, TVariables = unknown>({
  path,
  method = 'POST',
  invalidatePath,
}: UseApiMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) => mutate<TData, TVariables>(method, path, variables),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['api', invalidatePath ?? path] });
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
