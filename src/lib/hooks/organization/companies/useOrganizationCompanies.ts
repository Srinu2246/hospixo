'use client';

import { useQuery } from '@tanstack/react-query';

import {
  loadOrganizationCompanies,
  shouldLoadOrganizationCompanyList,
} from '@/lib/helpers/organizationCompanies';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import { api } from '@/services/api/browserClient';
import { useSidebarStore } from '@/stores/sidebarStore';

export function useOrganizationCompanies(
  organizationId?: number,
  initialCompanies?: CompanyListItem[],
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
      loadOrganizationCompanies(orgId, (path, params) => api.get<unknown>(path, params), {
        role,
        authScope,
        scope: 'organization',
      }),
    initialData: initialCompanies,
    enabled: canFetch && orgId != null,
    staleTime: 30_000,
    refetchOnMount: initialCompanies ? false : undefined,
  });
}
