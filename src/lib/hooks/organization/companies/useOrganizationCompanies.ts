'use client';

import { useQuery } from '@tanstack/react-query';

import { loadOrganizationCompanies } from '@/lib/helpers/organizationCompanies';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import { api } from '@/services/api/browserClient';

export function useOrganizationCompanies(
  organizationId?: number,
  initialCompanies?: CompanyListItem[],
) {
  return useQuery({
    queryKey: ['organization', 'companies', organizationId ?? 'session'],
    queryFn: ({ signal }) =>
      loadOrganizationCompanies(organizationId, (path, params) =>
        api.get<unknown>(path, params, signal),
      ),
    initialData: initialCompanies,
    staleTime: 30_000,
  });
}
