'use client';

import { useQuery } from '@tanstack/react-query';

import { clientApi } from '@/lib/client-api';
import { unwrapBffData } from '@/lib/bff-envelope';
import type { BranchMenuAssignment } from '../types/branch-menu';

import {
  mapBranchMenuAssignmentsApi,
  unwrapBranchMenuAssignmentList,
} from '../api/branch-menus-map';
import type { BranchMenuAssignmentApi } from '../types/branch-menu-api';

export const branchMenusQueryKey = (branchId: string | number) =>
  ['menu', 'branch-menus', String(branchId)] as const;

async function fetchBranchMenus(branchId: string | number): Promise<BranchMenuAssignment[]> {
  const res = await clientApi.get<unknown>(
    `/menu/branches/${encodeURIComponent(String(branchId))}/menus`,
  );
  const raw = unwrapBffData<unknown>(res);
  const list = unwrapBranchMenuAssignmentList(raw);
  if (list.length > 0 && (list[0] as Record<string, unknown>).branch_id !== undefined) {
    return mapBranchMenuAssignmentsApi(list as BranchMenuAssignmentApi[]);
  }
  return Array.isArray(raw)
    ? (raw as BranchMenuAssignment[])
    : (list as unknown as BranchMenuAssignment[]);
}

export function useBranchMenusQuery(branchId: string | number | null | undefined, enabled = true) {
  return useQuery({
    queryKey: branchMenusQueryKey(branchId ?? 'unknown'),
    queryFn: () => {
      if (branchId == null) throw new Error('Branch id is required');
      return fetchBranchMenus(branchId);
    },
    enabled: enabled && branchId != null,
  });
}
