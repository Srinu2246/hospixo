'use client';

import { useQuery } from '@tanstack/react-query';

import { loadEmployeeDirectory } from '@/lib/helpers/employees/loadEmployeeDirectory';
import { enrichDirectoryWithSession } from '@/lib/helpers/employees/sessionDirectoryFallback';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import { api } from '@/services/api/browserClient';
import { useSidebarStore } from '@/stores/sidebarStore';

export type EmployeeDirectory = {
  companies: CompanyListItem[];
  branches: BranchListItem[];
};

export function useEmployeeDirectory(organizationId?: number, companyId?: number) {
  return useQuery({
    queryKey: ['employees', 'directory', organizationId ?? 'session', companyId ?? 'all'],
    queryFn: async ({ signal }) => {
      const { context, account } = useSidebarStore.getState();
      const resolvedOrgId =
        organizationId ?? context.organizationId ?? account?.org_id ?? undefined;
      const resolvedCompanyId = companyId ?? context.companyId ?? account?.company_id ?? undefined;

      const get = (
        path: string,
        params?: Record<string, string | number | boolean | null | undefined>,
      ) => api.get<unknown>(path, params, signal);

      const sessionHints = {
        companyId: resolvedCompanyId,
        companyName: context.companyName,
        branchId: context.branchId ?? account?.branch_id ?? undefined,
        branchName: context.branchName,
      };

      try {
        return await loadEmployeeDirectory(
          {
            organizationId: resolvedOrgId,
            companyId: resolvedCompanyId,
            session: sessionHints,
          },
          get,
        );
      } catch {
        return enrichDirectoryWithSession([], [], sessionHints);
      }
    },
    enabled: true,
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}
