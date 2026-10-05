import { apiClient } from '@api/client';

import type { OrganizationListResult } from '@/types/organization';

const ORGANIZATIONS_UPSTREAM_PATH = '/organizations';
const ORGANIZATIONS_BFF_PATH = '/api/organizations';

async function adminBffJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...init,
  });

  if (!response.ok) {
    throw new Error(`BFF request failed: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/** Upstream control-plane organizations list. */
export async function fetchOrganizationsFromApi(): Promise<OrganizationListResult> {
  return apiClient<OrganizationListResult>(ORGANIZATIONS_UPSTREAM_PATH);
}

/** Same-origin admin BFF organizations list. */
export async function fetchOrganizationsFromBff(): Promise<OrganizationListResult> {
  return adminBffJson<OrganizationListResult>(ORGANIZATIONS_BFF_PATH);
}
