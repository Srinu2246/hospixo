'use client';

import { useQuery } from '@tanstack/react-query';

import { listOrganizationsFromClient } from '@/services/organizations';

export const organizationQueryKeys = {
  all: ['organizations'] as const,
  list: () => [...organizationQueryKeys.all, 'list'] as const,
};

export function useOrganizationsList() {
  return useQuery({
    queryKey: organizationQueryKeys.list(),
    queryFn: listOrganizationsFromClient,
  });
}
