import type { MenuScope } from './menu-store';

export type CategoryFormValidationInput = Readonly<{
  name: string;
  requiresScopeSelection?: boolean;
  scope?: MenuScope;
  assignBranchId?: string | null;
}>;

export function getCategoryFormValidationError(input: CategoryFormValidationInput): string | null {
  if (!input.name.trim()) {
    return 'Category name is required.';
  }

  if (input.requiresScopeSelection && input.scope === 'branch' && !input.assignBranchId) {
    return 'Select an outlet for branch-only categories.';
  }

  return null;
}

export function canSubmitCategoryForm(input: CategoryFormValidationInput): boolean {
  return getCategoryFormValidationError(input) === null;
}
