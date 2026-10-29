'use client';

import { useQuery } from '@/lib/hooks/api/useQuery';

import {
  loadOrganizationCompanies,
  shouldLoadOrganizationCompanyList,
} from '@/lib/helpers/organizationCompanies';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import { api } from '@/services/api/browserClient';
import type { JsonValue } from '@/types/json';
import { useSidebarStore } from '@/stores/sidebarStore';

export type UseOrganizationCompaniesOptions = Readonly<{
  enabled?: boolean;
}>;

export function useOrganizationCompanies(
  organizationId?: number,
  initialCompanies?: CompanyListItem[],
  options?: UseOrganizationCompaniesOptions,
) {
  const role = useSidebarStore((state) => state.role || state.user?.role || '');
  const authScope = useSidebarStore((state) => state.account?.scope ?? '');
  const orgId = useSidebarStore(
    (state) => organizationId ?? state.account?.org_id ?? state.context.organizationId,
  );
  const canFetch = shouldLoadOrganizationCompanyList({
    role,
    authScope,
    scope: 'organization',
  });

  return useQuery({
    queryKey: ['organization', 'companies', orgId ?? 'session', role, authScope],
    queryFn: () =>
      loadOrganizationCompanies(orgId, (path, params) => api.get<JsonValue>(path, params), {
        role,
        authScope,
        scope: 'organization',
      }),
    initialData: initialCompanies,
    enabled: (options?.enabled ?? true) && canFetch && orgId != null,
    staleTime: 30_000,
    refetchOnMount: initialCompanies ? false : undefined,
  });
}
