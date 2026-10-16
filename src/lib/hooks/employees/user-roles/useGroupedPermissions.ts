'use client';

import { useQuery } from '@tanstack/react-query';

import { parseGroupedPermissions } from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

export function useGroupedPermissions() {
  return useQuery({
    queryKey: ['api', ApiUrlsV1.permissions.grouped],
    queryFn: async ({ signal }) =>
      parseGroupedPermissions(
        await api.get<unknown>(ApiUrlsV1.permissions.grouped, undefined, signal),
      ),
    staleTime: 60_000,
  });
}
