'use client';

import { useQuery } from '@/lib/hooks/api/useQuery';
import { useActiveBranchId } from '@/lib/hooks/menu/menus/menusHooks';
import type { MenuAssignment } from '@/lib/schemas/menu/menus/menusSchema';
import {
  parseBranchMenuTree,
  type NormalizedMenuTree,
} from '@/lib/schemas/menu/menus/menuTreeSchema';
import { restaurantBranchMenuTreePath } from '@/services/api/ApiUrlsV1';
import { api } from '@/services/api/browserClient';

export type MenuTreeQueryParams = {
  category_id?: number;
};

/** GET /v1/restaurant/branches/{branch_id}/menus/{assignment_id}/tree — POS & branch ordering. */
export function usePosBranchMenuTree(
  assignment: MenuAssignment | undefined,
  params?: MenuTreeQueryParams,
  branchId?: number,
) {
  const activeBranchId = useActiveBranchId(branchId);
  const enabled = Boolean(assignment && activeBranchId && assignment.id > 0);

  return useQuery({
    queryKey: [
      'restaurant',
      'branch-menu-tree',
      activeBranchId,
      assignment?.id,
      params ?? {},
    ] as const,
    enabled,
    staleTime: 30_000,
    queryFn: async ({ signal }): Promise<NormalizedMenuTree> => {
      if (!assignment) {
        throw new Error('Menu assignment is required');
      }
      const payload = await api.get(
        restaurantBranchMenuTreePath(activeBranchId, assignment.id),
        params?.category_id ? { category_id: params.category_id } : undefined,
        signal,
      );
      return parseBranchMenuTree(payload);
    },
  });
}
