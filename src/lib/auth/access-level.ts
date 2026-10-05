import type { TokenUserInfo } from '@/types/auth';
import { routes } from '@/config/routes';

export type AccessLevel = 'organisation' | 'company' | 'branch' | 'counter' | 'captain' | 'kitchen';

/** Org / company / branch hierarchy — used for route-scoped sidebars. */
export type HierarchyAccessLevel = 'organisation' | 'company' | 'branch';

export type HierarchyEscape = Readonly<{
  href: string;
  label: string;
}>;

type AccessUser = Pick<TokenUserInfo, 'roles' | 'scope' | 'company_id' | 'branch_id'>;

function normalizeRole(role: string): string {
  return role
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

export function hasAnyRole(roles: readonly string[], candidates: readonly string[]): boolean {
  const normalized = new Set(roles.map(normalizeRole));
  return candidates.some((role) => normalized.has(role));
}

export const ORG_ROLES = [
  'organisation_admin',
  'organization_admin',
  'org_admin',
  'org_owner',
  'tenant_admin',
] as const;

export const COMPANY_ROLES = ['company_admin', 'company_owner', 'company_manager'] as const;

export const BRANCH_ROLES = ['branch_manager', 'branch_admin', 'store_manager'] as const;

export const COUNTER_ROLES = ['cashier', 'counter', 'pos_cashier', 'counter_staff'] as const;

export const CAPTAIN_ROLES = ['captain', 'waiter', 'server', 'host'] as const;

export const CHEF_ROLES = ['chef', 'kitchen', 'kitchen_staff'] as const;

/**
 * Resolve the user's access level for sidebar + post-login home.
 * Operational roles (kitchen / captain / counter) win over hierarchy roles.
 */
export function resolveAccessLevel(user: AccessUser): AccessLevel {
  const { roles, scope, company_id: companyId, branch_id: branchId } = user;
  const scopeKey = normalizeRole(scope);

  if (hasAnyRole(roles, CHEF_ROLES)) return 'kitchen';
  if (hasAnyRole(roles, CAPTAIN_ROLES)) return 'captain';
  if (hasAnyRole(roles, COUNTER_ROLES)) return 'counter';

  if (
    hasAnyRole(roles, ORG_ROLES) ||
    scopeKey === 'organisation' ||
    scopeKey === 'organization' ||
    scopeKey === 'org'
  ) {
    return 'organisation';
  }

  if (
    hasAnyRole(roles, COMPANY_ROLES) ||
    scopeKey === 'company' ||
    (companyId != null && branchId == null)
  ) {
    return 'company';
  }

  if (hasAnyRole(roles, BRANCH_ROLES) || scopeKey === 'branch' || branchId != null) {
    return 'branch';
  }

  if (companyId != null) return 'company';

  return 'organisation';
}

/**
 * Company menu template (categories, items, fields).
 * Organisation owners drill into `/company/*` and share this access with company managers.
 */
export function canManageCompanyMenu(user: AccessUser): boolean {
  const level = resolveAccessLevel(user);
  return level === 'organisation' || level === 'company';
}

const HIERARCHY_RANK: Record<AccessLevel, number> = {
  organisation: 3,
  company: 2,
  branch: 1,
  counter: 0,
  captain: 0,
  kitchen: 0,
};

function pathMatches(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/**
 * Hierarchy level implied by the URL prefix (`/organisation`, `/company`, `/branch`).
 * Returns null for shared module routes (`/pos`, `/inventory`, `/reports`, …).
 */
export function resolveHierarchyLevelFromPath(pathname: string): HierarchyAccessLevel | null {
  if (pathMatches(pathname, '/organisation')) return 'organisation';
  if (pathMatches(pathname, '/company')) return 'company';
  if (pathMatches(pathname, '/branch')) return 'branch';
  // /captain and /cashier are operational namespaces — not hierarchy scope.
  return null;
}

/** True for captain / cashier flow URL prefixes. */
export function isOperationalFlowPath(pathname: string): boolean {
  return pathMatches(pathname, '/captain') || pathMatches(pathname, '/cashier');
}

function clampHierarchyLevel(level: HierarchyAccessLevel, userLevel: AccessLevel): AccessLevel {
  if (HIERARCHY_RANK[level] > HIERARCHY_RANK[userLevel]) {
    return userLevel;
  }
  return level;
}

/**
 * Hierarchy level for Users & Roles / create-role UI.
 * Prefers the active URL (or nav scope on shared routes like `/roles/create`),
 * then clamps so a user never manages roles above their own login level.
 */
export function resolveRoleManagementLevel(
  pathname: string,
  userLevel: AccessLevel,
  navScope?: HierarchyAccessLevel | null,
): HierarchyAccessLevel | null {
  if (userLevel !== 'organisation' && userLevel !== 'company' && userLevel !== 'branch') {
    return null;
  }

  const routeLevel = resolveHierarchyLevelFromPath(pathname);
  const contextLevel = routeLevel ?? navScope ?? null;

  if (!contextLevel) {
    return userLevel;
  }

  return clampHierarchyLevel(contextLevel, userLevel) as HierarchyAccessLevel;
}

/**
 * Pick sidebar by route so hierarchy matches the page:
 * - `/captain` → captain nav (always)
 * - `/cashier` → cashier / counter nav (always)
 * - `/organisation` → Companies + Branches (org only)
 * - `/company` → Branches (not Companies)
 * - `/branch` → floor ops (no Companies / Branches groups)
 *
 * Shared routes (`/pos`, `/inventory`, …) use `contextLevel` so branch/company
 * nav stays active after drilling in from `/branch` or `/company`.
 *
 * Higher-level users can drill down; lower-level users never see a wider nav.
 */
export function resolveSidebarLevel(
  pathname: string,
  userLevel: AccessLevel,
  contextLevel?: HierarchyAccessLevel | null,
): AccessLevel {
  // Dedicated flow namespaces always pin their own sidebar — never branch chrome.
  if (pathMatches(pathname, '/captain')) return 'captain';
  if (pathMatches(pathname, '/cashier')) return 'counter';

  // Operational roles keep their own limited nav on shared module routes too.
  if (userLevel === 'counter' || userLevel === 'captain' || userLevel === 'kitchen') {
    return userLevel;
  }

  const routeLevel = resolveHierarchyLevelFromPath(pathname);
  if (routeLevel) return clampHierarchyLevel(routeLevel, userLevel);

  if (contextLevel) return clampHierarchyLevel(contextLevel, userLevel);

  return userLevel;
}

/** Dashboard home for a hierarchy access level (null for operational roles). */
export function resolveHierarchyHomePath(level: AccessLevel): string | null {
  switch (level) {
    case 'organisation':
      return routes.dashboard.organisation;
    case 'company':
      return routes.dashboard.company;
    case 'branch':
      return routes.dashboard.branch;
    default:
      return null;
  }
}

/**
 * When a hierarchy user is viewing a lower (or operational) sidebar, offer a
 * one-click return to their own dashboard. Captain / cashier never see this.
 */
export function resolveHierarchyEscape(
  userLevel: AccessLevel,
  sidebarLevel: AccessLevel,
): HierarchyEscape | null {
  if (userLevel !== 'organisation' && userLevel !== 'company' && userLevel !== 'branch') {
    return null;
  }

  if (sidebarLevel === userLevel) return null;

  const href = resolveHierarchyHomePath(userLevel);
  if (!href) return null;

  let label = 'Back to branch';
  if (userLevel === 'organisation') label = 'Back to organisation';
  else if (userLevel === 'company') label = 'Back to company';

  return { href, label };
}
