import { fetchOrganizationsFromApi, fetchOrganizationsFromBff } from '@/api/organizations';
import { organizationFallbackList } from '@/constants/organizations';
import type { OrganizationListResult } from '@/types/organization';

export function excludeDraftOrganizations(data: OrganizationListResult): OrganizationListResult {
  const items = data.items.filter((item) => item.status !== 'draft');
  return {
    ...data,
    items,
    total: items.length,
  };
}

/** Server BFF route: upstream list with fallback fixtures. */
export async function listOrganizations(): Promise<OrganizationListResult> {
  try {
    const data = await fetchOrganizationsFromApi();
    return excludeDraftOrganizations(data);
  } catch {
    return excludeDraftOrganizations(organizationFallbackList);
  }
}

/** Client: BFF list with shared list rules. */
export async function listOrganizationsFromClient(): Promise<OrganizationListResult> {
  const data = await fetchOrganizationsFromBff();
  return excludeDraftOrganizations(data);
}
