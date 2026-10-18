'use client';

import { useQuery } from '@tanstack/react-query';

import { parseMenuAssignments } from '@/lib/schemas/menu/menus/menuListSchema';
import { useSidebarStore } from '@/stores/sidebarStore';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import { api } from '@/services/api/browserClient';

export type BranchMenusListParams = {
  status?: string;
  page?: number;
  page_size?: number;
};

export function useActiveBranchId(propBranchId?: number) {
  const storeBranchId = useSidebarStore(
    (state) => state.context.branchId ?? state.account?.branch_id ?? undefined,
  );
  return propBranchId ?? storeBranchId ?? 49;
}

export const branchMenusQueryKey = (branchId: number, params?: BranchMenusListParams) =>
  ['restaurant', 'branch-menus', branchId, params ?? {}] as const;

/**
 * Restaurant branch menus list.
 * GET /v1/restaurant/branches/{branch_id}/menus
 */
export function useBranchMenus(params?: BranchMenusListParams, branchId?: number) {
  const activeBranchId = useActiveBranchId(branchId);

  return useQuery({
    queryKey: branchMenusQueryKey(activeBranchId, params),
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        ApiUrlsV1.restaurant.branchMenus.list(activeBranchId),
        {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 15,
          ...(params?.status && params.status !== 'all' ? { status: params.status } : {}),
        },
        signal,
      );
      return parseMenuAssignments(payload);
    },
  });
}
