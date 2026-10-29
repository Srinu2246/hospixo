import type { SidebarContext } from '@/app/sidebar';
import { normalizeRoleKey } from '@/app/sidebar';

export type TopNavbarLevel = 'organization' | 'company' | 'branch';

function normalizeScopeSlug(value: string): string {
  return decodeURIComponent(value).trim().toLowerCase();
}

/**
 * Determines whether the given URL path corresponds to an organization,
 * company, or branch scope.
 */
export function getPathNavbarLevel(
  pathname: string,
  context?: SidebarContext,
): TopNavbarLevel | null {
  if (!pathname) {
    return null;
  }

  if (pathname === '/organization' || pathname.startsWith('/organization/')) {
    return 'organization';
  }

  if (pathname === '/company' || pathname.startsWith('/company/')) {
    return 'company';
  }

  if (
    pathname === '/branch-manager' ||
    pathname.startsWith('/branch-manager/') ||
    pathname === '/branch' ||
    pathname.startsWith('/branch/') ||
    pathname.startsWith('/pos') ||
    pathname.startsWith('/waiter') ||
    pathname.startsWith('/cashier') ||
    pathname.startsWith('/kitchen') ||
    pathname.startsWith('/chef')
  ) {
    return 'branch';
  }

  const scopedRoot = pathname.match(/^\/([^/]+)(?:\/|$)/);
  if (!scopedRoot) {
    return null;
  }

  const segment = normalizeScopeSlug(scopedRoot[1]);

  const branchSlug = context?.branchSlug ?? context?.branchName;
  if (branchSlug && segment === normalizeScopeSlug(String(branchSlug))) {
    return 'branch';
  }

  const companySlug = context?.companySlug ?? context?.companyName;
  if (companySlug && segment === normalizeScopeSlug(String(companySlug))) {
    return 'company';
  }

  const orgSlug = context?.organizationSlug ?? context?.organizationName;
  if (orgSlug && segment === normalizeScopeSlug(String(orgSlug))) {
    return 'organization';
  }

  if (segment === 'organization') {
    return 'organization';
  }
  if (segment === 'company') {
    return 'company';
  }
  if (segment === 'branch-manager' || segment === 'branch') {
    return 'branch';
  }

  return null;
}

/**
 * Determines the default navbar level from the authenticated user's role.
 */
export function getRoleNavbarLevel(role?: string): TopNavbarLevel {
  const normalized = normalizeRoleKey(role || '');
  if (normalized === 'organization' || normalized === 'super_admin') {
    return 'organization';
  }
  if (normalized === 'company') {
    return 'company';
  }
  return 'branch';
}

/**
 * Resolves the active top navbar level from path first (for drill-down views),
 * falling back to authenticated role.
 */
export function resolveTopNavbarLevel(
  pathname: string,
  role?: string,
  context?: SidebarContext,
): TopNavbarLevel {
  const pathLevel = getPathNavbarLevel(pathname, context);
  if (pathLevel) {
    return pathLevel;
  }
  return getRoleNavbarLevel(role);
}
