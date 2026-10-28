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

function isBranchSessionScope(
  resolvedScope: ScopeType,
  accountScope?: string | null,
  contextBranchId?: number | null,
): boolean {
  return (
    resolvedScope === 'branch' ||
    accountScope?.toLowerCase() === 'branch' ||
    contextBranchId != null
  );
}

/**
 * Resolves the active branch display name from session or directory (no useEffect).
 * Branch-authenticated sessions never trigger directory HTTP — names come from context/account only.
 */
export function useResolvedBranchName(
  explicitName?: string,
  options?: { scope?: ScopeType },
): string | undefined {
  const pathname = usePathname() || '';
  const contextBranchName = useSidebarStore((state) => state.context.branchName);
  const contextBranchId = useSidebarStore((state) => state.context.branchId);
  const account = useSidebarStore((state) => state.account);
  const accountBranchId = account?.branch_id ?? undefined;
  const organizationId = useSidebarStore(
    (state) => state.context.organizationId ?? state.account?.org_id ?? undefined,
  );

  const resolvedScope = resolveScopeFromPathname(pathname, options?.scope);
  const isBranchScope = isBranchSessionScope(
    resolvedScope,
    account?.scope,
    contextBranchId ?? accountBranchId,
  );

  const branchId = contextBranchId ?? accountBranchId;

  const candidateExplicit = explicitName?.trim();
  const validExplicit =
    candidateExplicit && !isFallbackEntityName(candidateExplicit) ? candidateExplicit : undefined;

  const candidateContext = contextBranchName?.trim();
  const validContext =
    candidateContext && !isFallbackEntityName(candidateContext) ? candidateContext : undefined;

  const fromAccountRaw = readBranchNameFromAccount(account);
  const validAccount =
    fromAccountRaw && !isFallbackEntityName(fromAccountRaw) ? fromAccountRaw : undefined;

  const sessionBranchName = validContext || validAccount || validExplicit;

  const directory = useEmployeeDirectory(organizationId, undefined, {
    scope: 'branch',
    enabled: !isBranchScope,
  });

  const fromDirectory = useMemo(() => {
    if (isBranchScope) return undefined;
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
  }, [isBranchScope, directory.data?.branches, branchId, explicitName, contextBranchName]);

  if (isBranchScope) {
    return sessionBranchName || undefined;
  }

  return fromDirectory || validExplicit || validContext || undefined;
}

function readBranchNameFromAccount(
  account: { branch_name?: string; scope?: string } | null | undefined,
): string | undefined {
  if (!account) return undefined;
  const flat = account.branch_name?.trim();
  if (flat) return flat;
  return undefined;
}
