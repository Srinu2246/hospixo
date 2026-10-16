'use client';

import { useMemo } from 'react';

import { guestMenuCopy } from '@/features/floor-table-setup/config/guest-menu';
import { buildSectionGuestMenuUrl } from '@/features/floor-table-setup/lib/build-section-guest-menu-url';
import { parsePositiveIntId } from '@/features/floor-table-setup/lib/parse-public-menu-ids';
import type { SectionGuestMenuTarget } from '@/features/floor-table-setup/types/section-guest-menu';
import { pickActiveBranchMenuAssignment } from '@/features/menu/lib/resolve-active-branch-assignment';
import { useBranchMenusQuery } from '@/lib/hooks/menu/use-branch-menus-query';

type UseSectionGuestMenuUrlInput = Readonly<{
  section: SectionGuestMenuTarget | null;
  outletLabel: string;
  outletId?: string | null;
  floorId: string | null;
  /** Numeric branch id used for menu assignment APIs and guest-menu query params. */
  branchId: string | number | null;
}>;

export function useSectionGuestMenuUrl({
  section,
  outletLabel,
  outletId,
  floorId,
  branchId,
}: UseSectionGuestMenuUrlInput): Readonly<{
  menuUrl: string | null;
  error: string | null;
  isPending: boolean;
}> {
  const branchNumericId = typeof branchId === 'number' ? branchId : parsePositiveIntId(branchId);
  const branchMenusQuery = useBranchMenusQuery(branchNumericId, section != null);

  const menuId = useMemo(() => {
    if (!branchMenusQuery.data?.length) return null;
    const assignment = pickActiveBranchMenuAssignment(branchMenusQuery.data, {
      menuType: 'dine_in',
    });
    return assignment?.menuId ?? null;
  }, [branchMenusQuery.data]);

  const menuUrl = useMemo(() => {
    if (section == null || floorId == null || branchNumericId == null || menuId == null) {
      return null;
    }
    return buildSectionGuestMenuUrl({
      outletLabel,
      outletId,
      section,
      floorId,
      branchId: branchNumericId,
      menuId,
    });
  }, [section, floorId, branchNumericId, menuId, outletLabel, outletId]);

  const error = useMemo(() => {
    if (section == null) return null;
    if (branchNumericId == null) return guestMenuCopy.missingParams;
    if (floorId == null) return guestMenuCopy.missingParams;
    if (branchMenusQuery.isError) {
      return branchMenusQuery.error instanceof Error
        ? branchMenusQuery.error.message
        : guestMenuCopy.missingBranchMenu;
    }
    if (!branchMenusQuery.isPending && menuId == null) return guestMenuCopy.missingBranchMenu;
    if (!branchMenusQuery.isPending && menuUrl == null) return guestMenuCopy.missingParams;
    return null;
  }, [
    section,
    branchNumericId,
    floorId,
    branchMenusQuery.isError,
    branchMenusQuery.error,
    branchMenusQuery.isPending,
    menuId,
    menuUrl,
  ]);

  return {
    menuUrl,
    error,
    isPending: branchMenusQuery.isPending,
  };
}
