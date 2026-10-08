'use client';

import { useCallback } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';

import { menuManagementQueryKeyPrefix } from './menu-management-query-keys';

export async function invalidateMenuManagementQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: menuManagementQueryKeyPrefix });
}

export function useInvalidateMenuManagementQueries() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await invalidateMenuManagementQueries(queryClient);
  }, [queryClient]);
}
