import type { HttpMethod } from '@/services/api/types';

const BRANCH_MENUS_PATH = /^\/v1\/restaurant\/branches\/(\d+)\/menus$/;

export function resolveBranchMenuAssignmentsMock(
  path: string,
  method: HttpMethod,
): unknown | undefined {
  if (method !== 'GET') return undefined;

  const match = BRANCH_MENUS_PATH.exec(path);
  if (!match) return undefined;

  const branchId = Number(match[1]);

  return {
    success: true,
    message: 'OK',
    data: [
      {
        id: 1,
        branch_id: branchId,
        menu_id: 1,
        menu_name: 'Dine-In Menu',
        menu_type: 'dine_in',
        status: 'active',
        is_default: true,
        display_order: 0,
      },
    ],
  };
}
