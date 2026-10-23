'use client';

import { useEffect, useMemo } from 'react';

import { loadCompanyById } from '@/lib/helpers/organizationCompanies';
import { useEmployeeDirectory } from '@/lib/hooks/employees/user-roles';
import { useSidebarStore } from '@/stores/sidebarStore';
import { api } from '@/services/api/browserClient';

/** Resolves the active company display name from session, /me, or directory lookup. */
export function useResolvedCompanyName(explicitName?: string): string | undefined {
  const contextCompanyName = useSidebarStore((state) => state.context.companyName);
  const contextCompanyId = useSidebarStore((state) => state.context.companyId);
  const account = useSidebarStore((state) => state.account);
  const organizationId = useSidebarStore(
    (state) => state.context.organizationId ?? state.account?.org_id ?? undefined,
  );
  const setContext = useSidebarStore((state) => state.setContext);

  const companyId = contextCompanyId ?? account?.company_id ?? undefined;
  const directory = useEmployeeDirectory(organizationId, companyId);

  const fromDirectory = useMemo(() => {
    const companies = directory.data?.companies ?? [];
    if (companyId != null) {
      return companies.find((company) => String(company.id) === String(companyId))?.name?.trim();
    }
    return companies[0]?.name?.trim();
  }, [directory.data?.companies, companyId]);

  const fromAccount = readNestedEntityName(
    account as Record<string, unknown> | undefined,
    'company',
  );

  const resolved =
    explicitName?.trim() || contextCompanyName?.trim() || fromAccount || fromDirectory || undefined;

  useEffect(() => {
    if (!resolved || contextCompanyName === resolved) return;
    setContext({ companyName: resolved });
  }, [resolved, contextCompanyName, setContext]);

  useEffect(() => {
    if (resolved || companyId == null) return;

    let cancelled = false;
    void loadCompanyById(companyId, (path, params) => api.get(path, params))
      .then((detail) => {
        if (cancelled || !detail?.name?.trim()) return;
        setContext({ companyId, companyName: detail.name.trim() });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [resolved, companyId, setContext]);

  return resolved;
}

function readNestedEntityName(
  record: Record<string, unknown> | undefined,
  key: 'company' | 'branch',
): string | undefined {
  if (!record) return undefined;
  const flat = record[`${key}_name`];
  if (typeof flat === 'string' && flat.trim()) return flat.trim();
  const nested = record[key];
  if (typeof nested === 'string' && nested.trim()) return nested.trim();
  if (typeof nested === 'object' && nested !== null && !Array.isArray(nested)) {
    const name = (nested as Record<string, unknown>).name;
    if (typeof name === 'string' && name.trim()) return name.trim();
  }
  return undefined;
}
