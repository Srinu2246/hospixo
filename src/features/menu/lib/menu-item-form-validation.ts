import type { MenuScope } from './menu-store';

export type MenuItemFormValidationInput = Readonly<{
  categoryId: string;
  name: string;
  code: string;
  basePrice: string;
  gst?: string;
  gstRateId?: string;
  requiresGstSelection?: boolean;
  requiresScopeSelection?: boolean;
  scope?: MenuScope;
  assignBranchId?: string | null;
}>;

export function getMenuItemFormValidationErrors(
  input: MenuItemFormValidationInput,
): Record<string, string> {
  const errs: Record<string, string> = {};

  if (!input.categoryId) {
    errs.categoryId = 'Category is required.';
  }
  if (!input.name.trim()) {
    errs.name = 'Item name is required.';
  }
  if (!input.code.trim()) {
    errs.code = 'Code is required.';
  }

  if (input.requiresGstSelection && !input.gstRateId?.trim() && !input.gst?.trim()) {
    errs.gst = 'Select a GST rate.';
  }

  const price = Number(input.basePrice);
  if (!input.basePrice.trim() || Number.isNaN(price) || price <= 0) {
    errs.basePrice = 'Valid price is required.';
  }

  if (input.requiresScopeSelection && input.scope === 'branch' && !input.assignBranchId) {
    errs.form = 'Select an outlet for branch-only items.';
  }

  return errs;
}

export function canSubmitMenuItemForm(input: MenuItemFormValidationInput): boolean {
  return Object.keys(getMenuItemFormValidationErrors(input)).length === 0;
}
