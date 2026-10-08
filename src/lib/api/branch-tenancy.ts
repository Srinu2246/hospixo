export type BranchRouteSearchParams = Readonly<{
  outlet?: string;
  branch_id?: string;
}>;

/** Positive numeric branch id, or null for invalid and mock dashboard ids. */
export function toPositiveBranchId(value: unknown): number | null {
  if (value == null || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Dashboard fixture ids are not valid floor API branch ids. */
export function isMockDashboardOutletId(value: string | null | undefined): boolean {
  if (!value || value === 'all') return false;
  return /^outlet-\d+$/i.test(value.trim());
}

export function resolveBranchOutletId(
  urlOutlet: string | null | undefined,
  dashboardOutletId: string | null | undefined,
): number | null {
  const fromUrl = urlOutlet?.trim();
  const urlCandidate =
    fromUrl && fromUrl !== 'all' && !isMockDashboardOutletId(fromUrl) ? fromUrl : null;

  const fromDashboard = dashboardOutletId?.trim();
  const dashboardCandidate =
    fromDashboard && fromDashboard !== 'all' && !isMockDashboardOutletId(fromDashboard)
      ? fromDashboard
      : null;

  return toPositiveBranchId(urlCandidate ?? dashboardCandidate);
}

export function parseBranchRouteSearchParams(searchParams: BranchRouteSearchParams): number | null {
  return resolveBranchOutletId(searchParams.branch_id ?? searchParams.outlet, null);
}
