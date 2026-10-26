'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

import { useEmployeeDirectory } from '@/lib/hooks/employees/user-roles';
import { useSidebarStore } from '@/stores/sidebarStore';
import {
  resolveScopeFromPathname,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { isFallbackEntityName } from '@/lib/helpers/employees/userRolesHelpers';

/**
 * Resolves the active branch display name from directory lookup or session without fallback strings.
 * Strictly uses useMemo derivation (no useEffect).
 */
export function useResolvedBranchName(
  explicitName?: string,
  options?: { scope?: ScopeType },
): string | undefined {
  const pathname = usePathname() || '';
  const contextBranchName = useSidebarStore((state) => state.context.branchName);
  const contextCompanyId = useSidebarStore((state) => state.context.companyId);
  const contextBranchId = useSidebarStore((state) => state.context.branchId);
  const account = useSidebarStore((state) => state.account);
  const accountBranchId = account?.branch_id ?? undefined;
  const organizationId = useSidebarStore(
    (state) => state.context.organizationId ?? state.account?.org_id ?? undefined,
  );

  const resolvedScope = resolveScopeFromPathname(pathname, options?.scope);
  const isBranchScope =
    resolvedScope === 'branch' || account?.scope === 'branch' || contextBranchId != null;

  const companyId = contextCompanyId ?? account?.company_id ?? undefined;
  const branchId = contextBranchId ?? accountBranchId;

  const directory = useEmployeeDirectory(organizationId, companyId, {
    scope: isBranchScope ? 'branch' : companyId != null ? 'company' : 'organization',
  });

  const fromDirectory = useMemo(() => {
    const branches = directory.data?.branches ?? [];
    if (branches.length === 0) return undefined;

    if (branchId != null) {
      const byId = branches.find((branch) => String(branch.id) === String(branchId));
      if (byId?.name && !isFallbackEntityName(byId.name)) {
        return byId.name.trim();
      }
    }

    if (branches.length === 1 && !isFallbackEntityName(branches[0]?.name)) {
      return branches[0].name.trim();
    }

    const candidateName = explicitName || contextBranchName;
    if (candidateName && !isFallbackEntityName(candidateName)) {
      const byName = branches.find(
        (b) => b.name?.trim().toLowerCase() === candidateName.trim().toLowerCase(),
      );
      if (byName?.name && !isFallbackEntityName(byName.name)) {
        return byName.name.trim();
      }
    }

    const firstReal = branches.find((b) => !isFallbackEntityName(b.name));
    return firstReal?.name?.trim();
  }, [directory.data?.branches, branchId, explicitName, contextBranchName]);

  const candidateExplicit = explicitName?.trim();
  const validExplicit =
    candidateExplicit && !isFallbackEntityName(candidateExplicit) ? candidateExplicit : undefined;

  const candidateContext = contextBranchName?.trim();
  const validContext =
    candidateContext && !isFallbackEntityName(candidateContext) ? candidateContext : undefined;

  return fromDirectory || validExplicit || validContext || undefined;
}
