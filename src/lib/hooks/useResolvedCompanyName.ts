'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

import { loadCompanyById } from '@/lib/helpers/organizationCompanies';
import { useEmployeeDirectory } from '@/lib/hooks/employees/user-roles';
import { useQuery } from '@/lib/hooks/api/useQuery';
import { useSidebarStore } from '@/stores/sidebarStore';
import {
  isRecord,
  resolveScopeFromPathname,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { isFallbackEntityName } from '@/lib/helpers/employees/userRolesHelpers';
import { api } from '@/services/api/browserClient';
import type { JsonObject } from '@/types/json';

/** Resolves the active company display name from session, directory, or company detail (no useEffect). */
export function useResolvedCompanyName(
  explicitName?: string,
  options?: { scope?: ScopeType },
): string | undefined {
  const pathname = usePathname() || '';
  const contextCompanyName = useSidebarStore((state) => state.context.companyName);
  const contextCompanyId = useSidebarStore((state) => state.context.companyId);
  const contextBranchId = useSidebarStore((state) => state.context.branchId);
  const account = useSidebarStore((state) => state.account);
  const organizationId = useSidebarStore(
    (state) => state.context.organizationId ?? state.account?.org_id ?? undefined,
  );

  const resolvedScope = resolveScopeFromPathname(pathname, options?.scope);
  const isBranchScope = resolvedScope === 'branch';

  const companyId = contextCompanyId ?? account?.company_id ?? undefined;
  const directory = useEmployeeDirectory(organizationId, companyId, {
    scope: isBranchScope ? 'branch' : companyId != null ? 'company' : 'organization',
  });

  const activeBranchId = contextBranchId ?? account?.branch_id ?? undefined;

  const fromBranchDirectory = useMemo(() => {
    if (resolvedScope !== 'branch') return undefined;
    const branches = directory.data?.branches ?? [];
    if (branches.length === 0) return undefined;

    const matched =
      (activeBranchId != null
        ? branches.find((branch) => String(branch.id) === String(activeBranchId))
        : undefined) ?? branches[0];

    const name = matched?.companyName?.trim();
    return name && !isFallbackEntityName(name) ? name : undefined;
  }, [resolvedScope, directory.data?.branches, activeBranchId]);

  const fromDirectory = useMemo(() => {
    const companies = directory.data?.companies ?? [];
    if (companies.length === 0) return undefined;

    if (companyId != null) {
      const byId = companies.find((company) => String(company.id) === String(companyId));
      if (byId?.name && !isFallbackEntityName(byId.name)) {
        return byId.name.trim();
      }
    }

    const firstReal = companies.find((c) => !isFallbackEntityName(c.name));
    return firstReal?.name?.trim();
  }, [directory.data?.companies, companyId]);

  const accountRecord = account as (typeof account & { company_name?: string }) | null;
  const fromAccountRaw =
    accountRecord?.company_name?.trim() ||
    readNestedEntityName(toJsonObject(accountRecord), 'company');
  const fromAccount =
    fromAccountRaw && !isFallbackEntityName(fromAccountRaw) ? fromAccountRaw.trim() : undefined;

  const validExplicit =
    explicitName?.trim() && !isFallbackEntityName(explicitName) ? explicitName.trim() : undefined;
  const validContext =
    contextCompanyName?.trim() && !isFallbackEntityName(contextCompanyName)
      ? contextCompanyName.trim()
      : undefined;

  const resolvedWithoutDetail =
    validExplicit ||
    fromBranchDirectory ||
    fromDirectory ||
    validContext ||
    fromAccount ||
    undefined;

  const needsCompanyDetail = !resolvedWithoutDetail && companyId != null && !isBranchScope;

  const companyDetailQuery = useQuery({
    queryKey: ['organization', 'company', 'detail', companyId ?? 'none'],
    enabled: needsCompanyDetail,
    queryFn: async ({ signal }) => {
      if (companyId == null) return null;
      return loadCompanyById(companyId, (path, params) => api.get(path, params, signal));
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  const fromCompanyDetail = useMemo(() => {
    const name = companyDetailQuery.data?.name?.trim();
    return name && !isFallbackEntityName(name) ? name : undefined;
  }, [companyDetailQuery.data?.name]);

  return resolvedWithoutDetail || fromCompanyDetail;
}

function toJsonObject(value: object | null | undefined): JsonObject | undefined {
  if (value == null || Array.isArray(value)) return undefined;
  return value as JsonObject;
}

function readNestedEntityName(
  record: JsonObject | undefined,
  key: 'company' | 'branch',
): string | undefined {
  if (!record) return undefined;
  const flat = record[`${key}_name`];
  if (typeof flat === 'string' && flat.trim()) return flat.trim();
  const nested = record[key];
  if (typeof nested === 'string' && nested.trim()) return nested.trim();
  if (isRecord(nested)) {
    const name = nested.name;
    if (typeof name === 'string' && name.trim()) return name.trim();
  }
  return undefined;
}
