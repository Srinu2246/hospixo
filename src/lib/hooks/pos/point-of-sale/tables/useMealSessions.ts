'use client';

import { useQuery } from '@/lib/hooks/api/useQuery';
import { parseMealSessions } from '@/lib/schemas/pos/point-of-sale/tables/mealSessionsSchema';
import { api } from '@/services/api/browserClient';
import { branchMealSessionsPath } from '@/services/api/ApiUrlsV1';

export const mealSessionsQueryKey = (branchId: number | undefined) =>
  ['pos', 'point-of-sale', 'meal-sessions', branchId] as const;

/**
 * Branch meal sessions for create-order.
 * GET /v1/branches/{branch_id}/meal-sessions
 */
export function useMealSessions(branchId: number | undefined) {
  return useQuery({
    queryKey: mealSessionsQueryKey(branchId),
    enabled: typeof branchId === 'number',
    staleTime: 60_000,
    queryFn: async ({ signal }) => {
      const payload = await api.get(branchMealSessionsPath(branchId as number), undefined, signal);
      return parseMealSessions(payload);
    },
  });
}
