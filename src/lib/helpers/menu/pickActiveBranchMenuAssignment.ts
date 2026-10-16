import type { BranchMenuAssignment } from '@/lib/schemas/menu/branchMenuAssignmentSchema';

function normalizeMenuType(value?: string): string {
  return (value ?? '').toLowerCase().replace(/\s+/g, '_');
}

export function menuTypeMatches(
  assignmentMenuType: string | undefined,
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
  if (!assignments.length) return null;

  const activeAssignments = assignments.filter((assignment) => {
    const s = String(assignment.status ?? '').toLowerCase();
    return s === 'active';
  });

  const targetType = options?.menuType ?? 'dine_in';
  const typed = activeAssignments.filter((assignment) =>
    menuTypeMatches(assignment.menuType, targetType),
  );

  const pool = typed.length > 0 ? typed : activeAssignments;
  const defaultAssignment = pool.find((a) => a.isDefault);
  if (defaultAssignment) return defaultAssignment;

  return pool.sort((a, b) => a.displayOrder - b.displayOrder)[0] ?? null;
}
