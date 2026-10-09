import type { BranchMenuAssignment } from '@/features/menu/types/branch-menu';
import type { RestaurantMenuType } from '@/features/menu/types/restaurant-menu';

function normalizeMenuType(value?: string): string {
  return (value ?? '').toLowerCase().replace(/\s+/g, '_');
}

export function menuTypeMatches(
  assignmentMenuType: RestaurantMenuType | undefined,
  targetMenuType: string,
): boolean {
  const normalizedTarget = normalizeMenuType(targetMenuType);
  const normalizedAssignment = normalizeMenuType(assignmentMenuType);

  if (!normalizedAssignment || normalizedAssignment === 'all') return true;
  if (normalizedTarget === 'all') return true;

  return normalizedAssignment === normalizedTarget;
}

/** Pick the active branch menu assignment for branch-scoped menu flows. */
export function pickActiveBranchMenuAssignment(
  assignments: readonly BranchMenuAssignment[],
  options?: { menuType?: string },
): BranchMenuAssignment | null {
  if (!assignments || assignments.length === 0) return null;

  const activeAssignments = assignments.filter((assignment) => {
    const s = String(assignment.status ?? '').toLowerCase();
    return s === 'active';
  });

  const pool = activeAssignments.length > 0 ? activeAssignments : assignments;

  const matchingAssignments = options?.menuType
    ? pool.filter((assignment) => menuTypeMatches(assignment.menuType, options.menuType!))
    : pool;

  const candidates = matchingAssignments.length > 0 ? matchingAssignments : pool;
  if (candidates.length === 0) return null;

  const defaultAssignment = candidates.find(
    (assignment) =>
      assignment.isDefault || Boolean((assignment as { is_default?: boolean }).is_default),
  );
  if (defaultAssignment) return defaultAssignment;

  return [...candidates].sort(
    (left, right) =>
      (left.displayOrder ?? (left as { display_order?: number }).display_order ?? 0) -
      (right.displayOrder ?? (right as { display_order?: number }).display_order ?? 0),
  )[0]!;
}
