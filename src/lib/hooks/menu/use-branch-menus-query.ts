'use client';

import { useQuery } from '@tanstack/react-query';

import type { BranchMenuAssignment } from '@/features/menu/types/branch-menu';
import { api } from '@/services/api/browserClient';
import { restaurantBranchMenusPath } from '@/services/api/ApiUrlsV1';

export const branchMenusQueryKey = (branchId: string | number) =>
  ['menu', 'branch-menus', String(branchId)] as const;

function mapBranchMenuAssignment(raw: Record<string, unknown>): BranchMenuAssignment | null {
  const id = raw.id ?? raw.assignment_id;
  const menuId = raw.menu_id ?? raw.menuId;
  const branchId = raw.branch_id ?? raw.branchId;
  if (id == null || menuId == null || branchId == null) return null;

  const statusRaw = String(raw.status ?? (raw.is_active === false ? 'inactive' : 'active'));
  const isDefault = Boolean(raw.is_default ?? raw.isDefault);

  return {
    id: String(id),
    branchId: String(branchId),
    menuId: String(menuId),
    menuName: typeof raw.menu_name === 'string' ? raw.menu_name : undefined,
    menuCode: typeof raw.menu_code === 'string' ? raw.menu_code : undefined,
    menuType: typeof raw.menu_type === 'string' ? raw.menu_type : undefined,
    displayOrder: Number(raw.display_order ?? raw.displayOrder ?? 0),
    isDefault,
    status: statusRaw.toLowerCase() === 'active' ? 'Active' : 'Inactive',
  };
}

function unwrapBranchMenuList(payload: unknown): BranchMenuAssignment[] {
  const envelopeData =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: unknown }).data
      : payload;

  const list = Array.isArray(envelopeData)
    ? envelopeData
    : envelopeData &&
        typeof envelopeData === 'object' &&
        Array.isArray((envelopeData as { items?: unknown }).items)
      ? (envelopeData as { items: unknown[] }).items
      : [];

  return list
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map(mapBranchMenuAssignment)
    .filter((row): row is BranchMenuAssignment => row != null);
}

async function fetchBranchMenus(branchId: string | number): Promise<BranchMenuAssignment[]> {
  const payload = await api.get<unknown>(
    restaurantBranchMenusPath(branchId),
    undefined,
    undefined,
    {
      redirectOnUnauthorized: false,
    },
  );
  return unwrapBranchMenuList(payload);
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
