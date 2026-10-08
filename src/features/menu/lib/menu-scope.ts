import type { MenuScope } from './menu-store';

export type MenuScopeSelection = Readonly<{
  scope: MenuScope;
  assignBranchId: string | null;
}>;

export function resolveMenuScopePayload(
  selection: MenuScopeSelection,
): Readonly<{ scope: MenuScope; assign_branch_id: number | null }> {
  if (selection.scope === 'branch' && selection.assignBranchId) {
    const branchId = Number(selection.assignBranchId);
    if (Number.isInteger(branchId) && branchId > 0) {
      return { scope: 'branch', assign_branch_id: branchId };
    }
  }

  return { scope: 'company', assign_branch_id: null };
}

export function matchesBranchScopeFilter(
  record: Readonly<{ scope?: MenuScope; assignBranchId?: string | null }>,
  filterBranchId: string | null,
): boolean {
  if (!filterBranchId) return true;
  if (record.scope === 'branch') {
    return record.assignBranchId === filterBranchId;
  }
  return true;
}
