import { mapMenuTreeApi, mapMenuTypeFromApi } from '@/features/menu/api/restaurant-menus-map';

import type { BranchMenuAssignment, BranchMenuTree } from '../types/branch-menu';
import type {
  BranchMenuAssignmentApi,
  BranchMenuAssignmentStatus,
  BranchMenuTreeApi,
} from '../types/branch-menu-api';

function mapAssignmentStatus(
  status: BranchMenuAssignmentStatus | string | undefined,
): BranchMenuAssignment['status'] {
  return String(status ?? '').toLowerCase() === 'active' ? 'Active' : 'Inactive';
}

export function mapBranchMenuAssignmentApi(
  assignment: BranchMenuAssignmentApi,
): BranchMenuAssignment {
  return {
    id: String(assignment.id),
    branchId: String(assignment.branch_id),
    menuId: String(assignment.menu_id),
    menuName: assignment.menu?.name,
    menuCode: assignment.menu?.code,
    menuType: assignment.menu ? mapMenuTypeFromApi(assignment.menu.menu_type) : undefined,
    displayOrder: assignment.display_order ?? 0,
    isDefault: assignment.is_default ?? false,
    status: mapAssignmentStatus(assignment.status),
    createdAt: assignment.created_at,
    updatedAt: assignment.updated_at,
  };
}

export function mapBranchMenuAssignmentsApi(
  assignments: readonly BranchMenuAssignmentApi[],
): BranchMenuAssignment[] {
  return assignments
    .map(mapBranchMenuAssignmentApi)
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

export function unwrapBranchMenuAssignmentList(
  data:
    | BranchMenuAssignmentApi[]
    | { items?: BranchMenuAssignmentApi[] }
    | { data?: BranchMenuAssignmentApi[] | { items?: BranchMenuAssignmentApi[] } }
    | unknown,
): BranchMenuAssignmentApi[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items as BranchMenuAssignmentApi[];
  if (Array.isArray(obj.data)) return obj.data as BranchMenuAssignmentApi[];
  if (
    obj.data &&
    typeof obj.data === 'object' &&
    Array.isArray((obj.data as Record<string, unknown>).items)
  ) {
    return (obj.data as Record<string, unknown>).items as BranchMenuAssignmentApi[];
  }
  return [];
}

export function mapBranchMenuTreeApi(tree: BranchMenuTreeApi): BranchMenuTree {
  return mapMenuTreeApi(tree);
}
