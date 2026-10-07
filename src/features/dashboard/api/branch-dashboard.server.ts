import 'server-only';

import { cache } from 'react';

import {
  loadLiveBranchesWithDiagnostics,
  type BranchLoadResult,
} from '@/features/dashboard/api/organisation-dashboard.server';
import { branchDashboardFallbackData } from '@/features/dashboard/config/branch/dashboard';
import { resolveDashboardScope } from '@/features/dashboard/lib/resolve-dashboard-scope';
import {
  dashboardLoadCopy,
  summarizeUserFacingLoadErrors,
} from '@/features/dashboard/lib/user-facing-load-error';
import type { BranchDashboardOverview } from '@/features/dashboard/types/branch-dashboard';
import { getServerAuthSession } from '@/lib/auth/session';

export type BranchDashboardBootstrap = Readonly<{
  data: BranchDashboardOverview;
  source: 'backend' | 'fallback';
  loadError?: string | null;
}>;

function summarizeLoadErrors(errors: readonly string[]): string | null {
  return summarizeUserFacingLoadErrors(errors);
}

export const getBranchDashboard = cache(
  async (
    searchParams: Record<string, string | string[] | undefined> = {},
  ): Promise<BranchDashboardBootstrap> => {
    try {
      const session = await getServerAuthSession();
      const scope = await resolveDashboardScope(searchParams, { mode: 'company' });

      const orgId =
        scope.orgId ??
        (session?.user.org_id && session.user.org_id > 0 ? session.user.org_id : null);

      if (!orgId) {
        return {
          data: branchDashboardFallbackData,
          source: 'fallback',
          loadError: dashboardLoadCopy.missingOrganization,
        };
      }

      const rawCompanyId = searchParams.company_id;
      const companyIdFromUrl = Array.isArray(rawCompanyId) ? rawCompanyId[0] : rawCompanyId;
      const resolvedCompanyId = companyIdFromUrl ?? scope.companyId ?? null;

      let branchesResult: BranchLoadResult = await loadLiveBranchesWithDiagnostics({
        orgId,
        companyId: resolvedCompanyId ?? undefined,
        scope: resolvedCompanyId ? 'company' : 'organisation',
      });

      const rawOutlet = searchParams.outlet ?? searchParams.branch_id ?? searchParams.branch;
      const targetBranchId = Array.isArray(rawOutlet)
        ? rawOutlet[0]
        : (rawOutlet ?? (session?.user.branch_id ? String(session.user.branch_id) : undefined));

      let branches = branchesResult.branches;
      let errors = branchesResult.errors;

      if (!resolvedCompanyId && targetBranchId && targetBranchId !== 'all') {
        const branchCompanyId = branches.find(
          (branch) => branch.id === String(targetBranchId),
        )?.companyId;
        if (branchCompanyId) {
          branchesResult = await loadLiveBranchesWithDiagnostics({
            orgId,
            companyId: branchCompanyId,
            scope: 'company',
          });
          branches = branchesResult.branches;
          errors = branchesResult.errors;
        }
      }

      const activeBranch =
        targetBranchId && targetBranchId !== 'all'
          ? (branches.find((b) => b.id === String(targetBranchId)) ?? branches[0])
          : branches[0];

      if (activeBranch) {
        const data: BranchDashboardOverview = {
          ...branchDashboardFallbackData,
          outletName: activeBranch.name,
          accountManager: {
            ...branchDashboardFallbackData.accountManager,
            outletId: activeBranch.id,
          },
        };

        return {
          data,
          source: 'backend',
          loadError: null,
        };
      }

      return {
        data: branchDashboardFallbackData,
        source: 'fallback',
        loadError: summarizeLoadErrors(errors) ?? dashboardLoadCopy.noBranches,
      };
    } catch {
      return {
        data: branchDashboardFallbackData,
        source: 'fallback',
        loadError: dashboardLoadCopy.unableToLoadDashboard,
      };
    }
  },
);
