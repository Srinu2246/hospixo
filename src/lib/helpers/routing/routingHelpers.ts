import { resolveSidebarRoute, type SidebarContext } from '@/app/sidebar';
import type { SidebarSession } from '@/lib/auth/session';

export type BranchListScope = 'organization' | 'company';

export function normalizeScopeSlug(value: string): string {
  return decodeURIComponent(value).trim().toLowerCase();
}

export function matchesScopeSlug(scopeSegment: string, slug?: string | null): boolean {
  if (!slug) return false;
  return normalizeScopeSlug(scopeSegment) === normalizeScopeSlug(String(slug));
}

/** Map `/PH/branches` or `/COMP1/branches/all-branches` scope segments to list mode. */
export function resolveScopedBranchList(
  scopeSegment: string,
  session: SidebarSession | null,
): { listScope: BranchListScope; companyId?: number } {
  const token = normalizeScopeSlug(scopeSegment);

  const companySlug = session?.context?.companySlug ?? session?.context?.companyName;
  const orgSlug = session?.context?.organizationSlug ?? session?.context?.organizationName;

  if (token === 'company' || matchesScopeSlug(scopeSegment, companySlug)) {
    const queryCompanyId = session?.account?.company_id ?? session?.context?.companyId;
    return {
      listScope: 'company',
      companyId: queryCompanyId,
    };
  }

  if (token === 'organization' || matchesScopeSlug(scopeSegment, orgSlug)) {
    return { listScope: 'organization' };
  }

  return { listScope: 'organization' };
}

/** Branch row → `/TEST-BRANCH1/dashboard` (via resolveSidebarRoute + branch slug in context). */
export function branchDashboardHref(
  branch: { id: number | string; name: string; code?: string | null },
  context: SidebarContext,
  role?: string,
): string {
  const branchSlug = branch.code?.trim() || String(branch.id);
  const nextContext: SidebarContext = {
    ...context,
    branchSlug,
    branchName: branch.name,
  };
  return resolveSidebarRoute('/branch-manager/dashboard', nextContext, role);
}

export function companyDashboardHref(context: SidebarContext, role?: string): string {
  return resolveSidebarRoute('/company/dashboard', context, role);
}
