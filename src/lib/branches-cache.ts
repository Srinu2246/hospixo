import type { ApiBranch } from '@/types/branches';
import type { DashboardOutlet } from '@/features/dashboard/types';

import { createClientResourceCache } from './client-resource-cache';

type BranchesApiResponse = Readonly<{
  success?: boolean;
  data?: Readonly<{ items?: readonly ApiBranch[]; total?: number }> | readonly ApiBranch[];
  items?: readonly ApiBranch[];
}>;

export type BranchesCacheScope = Readonly<{
  orgId?: string | null;
  companyId?: string | null;
}>;

function isBranchArray(value: unknown): value is readonly ApiBranch[] {
  return Array.isArray(value);
}

function unwrapBranches(payload: BranchesApiResponse | readonly ApiBranch[]): ApiBranch[] {
  if (isBranchArray(payload)) return [...payload];
  const data = payload.data;
  if (isBranchArray(data)) return [...data];
  if (data && typeof data === 'object' && Array.isArray(data.items)) {
    return [...data.items];
  }
  if (Array.isArray(payload.items)) return [...payload.items];
  return [];
}

function scopeCacheKey(scope: BranchesCacheScope = {}): string {
  const orgId = scope.orgId?.trim() || '_';
  const companyId = scope.companyId?.trim() || '_';
  return `${orgId}::${companyId}`;
}

function buildBranchesUrl(scope: BranchesCacheScope = {}): string {
  const params = new URLSearchParams();
  if (scope.companyId?.trim()) params.set('company_id', scope.companyId.trim());
  if (scope.orgId?.trim()) params.set('org_id', scope.orgId.trim());
  const query = params.toString();
  return query ? `/api/branches?${query}` : '/api/branches';
}

const branchesResource = createClientResourceCache<BranchesApiResponse, [BranchesCacheScope]>(
  buildBranchesUrl,
  scopeCacheKey,
);

async function loadBranchesFromApi(scope: BranchesCacheScope = {}): Promise<readonly ApiBranch[]> {
  try {
    const payload = await branchesResource.fetchResource(undefined, scope);
    return unwrapBranches(payload);
  } catch {
    return [];
  }
}

export type GetCachedBranchesOptions = Readonly<{
  forceRefresh?: boolean;
  scope?: BranchesCacheScope;
}>;

/**
 * Cached branch list for dashboard outlet picker and menu scoping.
 * Deduplicates concurrent requests (including React StrictMode double-mount).
 */
export async function getCachedBranches(
  options: GetCachedBranchesOptions = {},
): Promise<readonly ApiBranch[]> {
  const scope = options.scope ?? {};
  if (options.forceRefresh) {
    branchesResource.clearCache(scopeCacheKey(scope));
  }
  return loadBranchesFromApi(scope);
}

/** Alias used by menu scoping UI — same cache as `getCachedBranches`. */
export async function fetchCompanyBranches(
  options: GetCachedBranchesOptions = {},
): Promise<readonly ApiBranch[]> {
  return getCachedBranches(options);
}

export function clearBranchesCache(scope?: BranchesCacheScope): void {
  if (scope) {
    branchesResource.clearCache(scopeCacheKey(scope));
    return;
  }
  branchesResource.clearCache();
}

/** Prefer SSR/bootstrap outlets so menu + topbar skip redundant GET /api/branches. */
export function branchOptionsFromDashboardOutlets(
  outlets: readonly DashboardOutlet[] | undefined,
): readonly { id: string; name: string }[] {
  if (!outlets?.length) return [];
  return outlets
    .filter((outlet) => outlet.id !== 'all')
    .map((outlet) => ({ id: String(outlet.id), name: outlet.name }));
}
