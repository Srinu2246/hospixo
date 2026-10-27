import type { MenuCataloguePageScope } from '@/lib/helpers/menuBranchContext';
import { matchesScopeSlug } from '@/lib/helpers/routing/routingHelpers';
import { useSidebarStore } from '@/stores/sidebarStore';

function positiveInt(value: unknown): number | undefined {
  if (value == null) return undefined;
  const id = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

/** Infer catalogue workspace from the URL (`/company`, `/branch-manager`, …). */
export function resolveCatalogueRouteScopeFromPathname(
  pathname: string,
): MenuCataloguePageScope | undefined {
  if (pathname.includes('/branch-manager/')) return 'branch';
  if (pathname.includes('/company/')) return 'company';
  if (pathname.includes('/organization/')) return 'organization';

  const firstSegment = pathname.split('/').filter(Boolean)[0];
  if (!firstSegment) return undefined;

  const { context } = useSidebarStore.getState();
  const companySlug = context.companySlug ?? context.companyName;
  const orgSlug = context.organizationSlug ?? context.organizationName;
  const branchSlug = context.branchSlug ?? context.branchName;

  if (matchesScopeSlug(firstSegment, companySlug)) return 'company';
  if (matchesScopeSlug(firstSegment, orgSlug)) return 'organization';
  if (matchesScopeSlug(firstSegment, branchSlug)) return 'branch';

  return undefined;
}

export type ResolvedCatalogueContextIds = {
  companyId?: number;
  branchId?: number;
};

/** Company / branch ids from sidebar session for menu catalogue APIs. */
export function resolveCatalogueContextIds(
  pageScope: MenuCataloguePageScope,
): ResolvedCatalogueContextIds {
  const { context, account } = useSidebarStore.getState();
  const companyId = positiveInt(context.companyId ?? account?.company_id);
  const branchId = positiveInt(context.branchId ?? account?.branch_id);

  if (pageScope === 'branch') {
    return { branchId, companyId };
  }

  return { companyId };
}

/**
 * Headers required by restaurant catalogue APIs (categories, menus, items).
 * Branch workspace: X-Branch-Id (optional X-Company-Id). Company workspace: X-Company-Id only.
 */
export function resolveUpstreamContextHeaders(options?: {
  pageScope?: MenuCataloguePageScope;
  pathname?: string;
}): Record<string, string> {
  const pageScope =
    options?.pageScope ??
    (options?.pathname
      ? resolveCatalogueRouteScopeFromPathname(options.pathname)
      : typeof window !== 'undefined'
        ? resolveCatalogueRouteScopeFromPathname(window.location.pathname)
        : undefined);

  const effectiveScope = pageScope ?? 'company';
  const ids = resolveCatalogueContextIds(effectiveScope);
  const headers: Record<string, string> = {};

  if (pageScope === 'branch') {
    if (ids.branchId != null) headers['X-Branch-Id'] = String(ids.branchId);
    if (ids.companyId != null) headers['X-Company-Id'] = String(ids.companyId);
    return headers;
  }

  if (pageScope === 'company' || pageScope === 'organization') {
    if (ids.companyId != null) headers['X-Company-Id'] = String(ids.companyId);
    return headers;
  }

  if (ids.companyId != null) headers['X-Company-Id'] = String(ids.companyId);
  else if (ids.branchId != null) headers['X-Branch-Id'] = String(ids.branchId);

  return headers;
}
