/**
 * Server-side Permissions API client.
 * Called only from platform BFF routes / SSR loaders — never from the browser.
 *
 * Integrated:
 * - getGroupedPermissions ← GET /api/v1/permissions/grouped
 */

import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import type { GroupedPermissionsResponse } from '@/types/roles';

export const permissionsPaths = {
  grouped: '/api/v1/permissions/grouped',
} as const;

function withAuth(token: string) {
  return {
    baseUrl: getServerApiBaseUrl(),
    token,
  };
}

/** GET /api/v1/permissions/grouped — catalog grouped by module/resource. */
export async function getGroupedPermissions(token: string) {
  return apiFetch<GroupedPermissionsResponse>(permissionsPaths.grouped, withAuth(token));
}
