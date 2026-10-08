/**
 * Server-only: branch → restaurant menu assignment aggregation for BFF.
 */

import { listBranches } from '@/lib/api/branches';
import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import { listBackendRestaurantMenus } from '@/lib/api/menu';

export type BranchMenuAssignmentRow = Readonly<{
  branchId: number;
  branchName: string;
  assignmentId: number | null;
  menuId: number | null;
  menuName: string | null;
  menuType: string | null;
  status: string | null;
}>;

type ApiBranchMenuRecord = Readonly<{
  id?: number;
  branch_menu_id?: number;
  assignment_id?: number;
  menu_id?: number;
  status?: string | null;
  menu?: Readonly<{
    id?: number;
    name?: string | null;
    menu_type?: string | null;
    status?: string | null;
  }> | null;
}>;

function restaurantBranchMenusPath(branchId: number | string, assignmentId?: number | string) {
  const base = `/api/v1/restaurant/branches/${encodeURIComponent(String(branchId))}/menus`;
  return assignmentId == null ? base : `${base}/${encodeURIComponent(String(assignmentId))}`;
}

function isActiveMenuStatus(status: string): boolean {
  return (
    status === 'active' || status === 'available' || status === 'published' || status === 'enabled'
  );
}

function toPositiveInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function unwrapBranchMenus(data: unknown): ApiBranchMenuRecord[] {
  if (Array.isArray(data)) return data as ApiBranchMenuRecord[];
  if (data != null && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of ['items', 'branch_menus', 'menus', 'data'] as const) {
      const value = record[key];
      if (Array.isArray(value)) return value as ApiBranchMenuRecord[];
    }
  }
  return [];
}

function resolveAssignmentId(record: ApiBranchMenuRecord): number | null {
  return toPositiveInt(record.id ?? record.branch_menu_id ?? record.assignment_id);
}

function pickPreferredAssignment(
  records: readonly ApiBranchMenuRecord[],
): ApiBranchMenuRecord | null {
  if (records.length === 0) return null;

  const dineIn = records.filter((record) => {
    const type = (record.menu?.menu_type ?? '').toLowerCase();
    return type.includes('dine');
  });

  const active = records.filter((record) =>
    isActiveMenuStatus((record.status ?? 'active').toLowerCase()),
  );
  let pool = records;
  if (dineIn.length > 0) {
    pool = dineIn;
  } else if (active.length > 0) {
    pool = active;
  }

  return (
    [...pool].sort((left, right) => {
      const leftDefault = isActiveMenuStatus((left.menu?.status ?? '').toLowerCase()) ? 1 : 0;
      const rightDefault = isActiveMenuStatus((right.menu?.status ?? '').toLowerCase()) ? 1 : 0;
      return rightDefault - leftDefault;
    })[0] ?? null
  );
}

async function branchMenuFetch<T>(
  token: string,
  path: string,
  init?: Readonly<{ method?: 'GET' | 'POST'; body?: unknown }>,
): Promise<T> {
  return apiFetch<T>(path, {
    baseUrl: getServerApiBaseUrl(),
    token,
    method: init?.method ?? 'GET',
    body: init?.body,
  });
}

/** List each branch with its preferred dine-in menu assignment. */
export async function listBranchMenuAssignmentRows(
  token: string,
): Promise<BranchMenuAssignmentRow[]> {
  const { items: branches } = await listBranches(token);
  const menusRaw = await listBackendRestaurantMenus(token, { status: 'active' });
  const menuNameById: Record<string, string> = {};

  if (Array.isArray(menusRaw)) {
    for (const menu of menusRaw as Array<{ id?: string | number; name?: string }>) {
      if (menu.id != null && menu.name) {
        menuNameById[String(menu.id)] = menu.name;
      }
    }
  }

  const assignments = await Promise.all(
    branches.map(async (branch) => {
      let records: ApiBranchMenuRecord[] = [];
      try {
        records = unwrapBranchMenus(
          await branchMenuFetch<unknown>(
            token,
            `${restaurantBranchMenusPath(branch.id)}?status=active`,
          ),
        );
        if (records.length === 0) {
          records = unwrapBranchMenus(
            await branchMenuFetch<unknown>(token, restaurantBranchMenusPath(branch.id)),
          );
        }
      } catch {
        records = [];
      }

      const assignment = pickPreferredAssignment(records);
      const assignmentId = assignment ? resolveAssignmentId(assignment) : null;
      const menuId = toPositiveInt(assignment?.menu_id ?? assignment?.menu?.id);

      return {
        branchId: branch.id,
        branchName: branch.name,
        assignmentId,
        menuId,
        menuName:
          menuId != null ? (menuNameById[String(menuId)] ?? assignment?.menu?.name ?? null) : null,
        menuType: assignment?.menu?.menu_type ?? null,
        status: assignment?.status ?? assignment?.menu?.status ?? null,
      };
    }),
  );

  return assignments;
}
