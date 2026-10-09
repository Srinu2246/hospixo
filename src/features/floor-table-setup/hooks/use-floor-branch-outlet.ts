'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import { isCaptainFlowPath } from '@/config/shell/flow-paths';
import { useAuth } from '@/context/auth';
import { useDashboardFilter } from '@/context/dashboard-filter';
import { resolveBranchOutletId } from '@/lib/api/branch-tenancy';

export type FloorActionScopeOptions = Readonly<{
  activeBranchId?: number | string | null;
  preferredBranchId?: number | string | null;
}>;

export function resolveActiveFloorBranchId(
  pathname: string,
  assignedBranchId: number | null,
  selectedBranchId: string | null,
  activeBranchId: number | string | null,
): number | null {
  if (isCaptainFlowPath(pathname)) return assignedBranchId;
  const fromPicker = resolveBranchOutletId(
    selectedBranchId,
    activeBranchId == null ? null : String(activeBranchId),
  );
  if (fromPicker != null) return fromPicker;
  return assignedBranchId;
}

/**
 * Captain routes are pinned to the assigned branch; other flows use the branch picker.
 * Org/company users stay branch-agnostic unless they selected a branch.
 */
export function useActiveBranchId(): number | null {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { activeBranchId } = useDashboardFilter();
  return resolveActiveFloorBranchId(
    pathname,
    user?.branch_id ?? null,
    searchParams.get('outlet') ?? searchParams.get('branch_id'),
    activeBranchId,
  );
}

/** String form of `useActiveBranchId` for path helpers. */
export function useFloorBranchOutletId(): string | null {
  const branchId = useActiveBranchId();
  return branchId == null ? null : String(branchId);
}

/** Server-action scope: pass the active or captain-assigned branch into floor mutations. */
export function useFloorActionScope(): FloorActionScopeOptions {
  const activeBranchId = useActiveBranchId();
  return activeBranchId ? { activeBranchId, preferredBranchId: activeBranchId } : {};
}
