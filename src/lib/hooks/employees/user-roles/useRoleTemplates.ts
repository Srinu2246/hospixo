'use client';

import { useQuery } from '@tanstack/react-query';

import {
  parseRoleTemplates,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

export function useRoleTemplates(scope: ScopeType = 'organization') {
  return useQuery({
    queryKey: ['api', ApiUrlsV1.roles.templates, scope],
    queryFn: async ({ signal }) => {
      const templatesPayload = await api.get<unknown>(ApiUrlsV1.roles.templates, undefined, signal);
      const fromTemplates = parseRoleTemplates(templatesPayload);
      if (fromTemplates.length > 0) return fromTemplates;

      const rolesPayload = await api.get<unknown>(ApiUrlsV1.roles.list, undefined, signal);
      return parseRoleTemplates(rolesPayload);
    },
    staleTime: 60_000,
  });
}
