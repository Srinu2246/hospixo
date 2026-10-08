'use client';

import { useSearchParams } from 'next/navigation';

import { useDashboardFilter } from '@/context/dashboard-filter';
import { resolveBranchOutletId } from '@/lib/api/branch-tenancy';

export type FloorActionScopeOptions = Readonly<{
  activeBranchId?: number | string | null;
  preferredBranchId?: number | string | null;
}>;

/**
 * Currently selected working branch — picker / `?outlet=` only.
 * Never falls back to `user.branch_id` (org/company admins stay branch-agnostic).
 */
export function useActiveBranchId(): number | null {
  const searchParams = useSearchParams();
  const { activeBranchId } = useDashboardFilter();
  const branchId = resolveBranchOutletId(
    searchParams.get('outlet') ?? searchParams.get('branch_id'),
    activeBranchId == null ? null : String(activeBranchId),
  );

  if (branchId != null) return branchId;

  const selected = searchParams.get('outlet') ?? activeBranchId;
  const fixtureMatch = selected?.match(/^outlet-(\d+)$/i);
  return fixtureMatch ? Number(fixtureMatch[1]) : null;
}

/** String form of `useActiveBranchId` for path helpers. */
export function useFloorBranchOutletId(): string | null {
  const branchId = useActiveBranchId();
  return branchId == null ? null : String(branchId);
}

/** Server-action scope: pass the picker-selected branch into floor mutations. */
export function useFloorActionScope(): FloorActionScopeOptions {
  const activeBranchId = useActiveBranchId();
  return activeBranchId ? { activeBranchId, preferredBranchId: activeBranchId } : {};
}
