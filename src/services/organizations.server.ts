import 'server-only';

import { fetchOrganizationsFromApi } from '@/api/organizations';
import { excludeDraftOrganizations } from '@/services/organizations';
import { listOrganizationsForAdmin } from '@/server/dev-organization-store';
import type { OrganizationListResult } from '@/types/organization';

/** Server-only organizations list for the admin BFF (fixtures + in-memory created orgs). */
export async function listOrganizationsForBff(): Promise<OrganizationListResult> {
  try {
    const data = await fetchOrganizationsFromApi();
    return excludeDraftOrganizations(data);
  } catch {
    return excludeDraftOrganizations(listOrganizationsForAdmin());
  }
}

/** Server-only organizations list (includes drafts) for create flows. */
export async function getOrganizations(_options?: { enrichCounts?: boolean }) {
  const data = listOrganizationsForAdmin();
  return { data, source: 'fallback' as const };
}
