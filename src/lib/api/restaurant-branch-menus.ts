import 'server-only';

import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import { restaurantBranchMenuItemsListPath, restaurantBranchMenusListPath } from '@/lib/api/paths';

function withAuth(token: string) {
  return {
    baseUrl: getServerApiBaseUrl(),
    token,
  };
}

function normalizeListPayload<T>(payload: unknown): { items: T[]; total: number } {
  if (Array.isArray(payload)) {
    return { items: payload as T[], total: payload.length };
  }
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.items)) {
      const total =
        typeof record.total === 'number'
          ? record.total
          : typeof record.count === 'number'
            ? record.count
            : record.items.length;
      return { items: record.items as T[], total };
    }
    if (Array.isArray(record.data)) {
      return { items: record.data as T[], total: record.data.length };
    }
  }
  return { items: [], total: 0 };
}

type BranchMenuAssignment = Readonly<{
  id: number | string;
  status?: string;
  is_active?: boolean;
}>;

export type BranchMenuItemOverride = Readonly<Record<string, unknown>>;

/** Active menu assignment for a branch, if any. */
export async function getActiveBranchMenuAssignmentId(
  token: string,
  branchId: number,
): Promise<number | string | null> {
  const path = restaurantBranchMenusListPath(branchId, { status: 'active' });
  const payload = await apiFetch<unknown>(path, { ...withAuth(token), method: 'GET' });
  const { items } = normalizeListPayload<BranchMenuAssignment>(payload);
  const active =
    items.find((item) => item.status === 'active' || item.is_active === true) ?? items[0];
  return active?.id ?? null;
}

/** Menu item overrides for branch POS dine-in. */
export async function listBranchMenuItems(
  token: string,
  branchId: number,
): Promise<readonly BranchMenuItemOverride[]> {
  const assignmentId = await getActiveBranchMenuAssignmentId(token, branchId);
  if (assignmentId == null) return [];

  const path = restaurantBranchMenuItemsListPath(branchId, assignmentId, { status: 'active' });
  const payload = await apiFetch<unknown>(path, { ...withAuth(token), method: 'GET' });
  const { items } = normalizeListPayload<BranchMenuItemOverride>(payload);
  return items;
}
