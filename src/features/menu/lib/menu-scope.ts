import type { MenuScope } from './menu-store';
import type { MenuPageConfig } from '../config/menu-page-config';
import type { DietaryType, MenuItem, OrderType } from '../types/menu';

export type MenuScopeSelection = Readonly<{
  scope: MenuScope;
  assignBranchId: string | null;
}>;

export function resolveMenuScopePayload(
  selection: MenuScopeSelection,
): Readonly<{ scope: MenuScope; assign_branch_id: number | null }> {
  if (selection.scope === 'branch') {
    if (selection.assignBranchId) {
      const branchId = Number(selection.assignBranchId);
      if (Number.isInteger(branchId) && branchId > 0) {
        return { scope: 'branch', assign_branch_id: branchId };
      }
    }
    return { scope: 'branch', assign_branch_id: null };
  }

  return { scope: 'company', assign_branch_id: null };
}

/** Company + branch menu creation load variants/images/tags via BFF for persisted ids. */
export function usesPersistedMenuItemApi(scope: MenuPageConfig['scope'] | undefined): boolean {
  return scope === 'company' || scope === 'branch';
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

/** Branch-created catalog rows the branch user may PATCH on `/menu/items/{id}`. */
export function isBranchOwnedMenuItem(
  item: Readonly<{ scope?: MenuScope; assignBranchId?: string | null }>,
  branchUserBranchId: string,
): boolean {
  return (
    item.scope === 'branch' && String(item.assignBranchId ?? '') === String(branchUserBranchId)
  );
}

/** Branch-created category rows the branch user may manage directly. */
export function isBranchOwnedCategory(
  category: Readonly<{ scope?: MenuScope; assignBranchId?: string | null }>,
  branchUserBranchId: string,
): boolean {
  return (
    category.scope === 'branch' &&
    String(category.assignBranchId ?? '') === String(branchUserBranchId)
  );
}

/** Inherited company (or other-branch) items must use branch menu item overrides. */
export function requiresBranchMenuItemOverride(
  item: Readonly<{ scope?: MenuScope; assignBranchId?: string | null }>,
  branchUserBranchId: string,
): boolean {
  return !isBranchOwnedMenuItem(item, branchUserBranchId);
}

const BRANCH_DEACTIVATED_CATEGORIES_KEY_PREFIX = 'hospixo_branch_deactivated_categories_';

export function getBranchDeactivatedCategoryIds(branchId: string | null | undefined): Set<string> {
  if (!branchId || typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(
      `${BRANCH_DEACTIVATED_CATEGORIES_KEY_PREFIX}${branchId}`,
    );
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map(String));
    }
  } catch {
    // ignore parse error
  }
  return new Set();
}

export function saveBranchDeactivatedCategory(
  branchId: string | null | undefined,
  categoryId: string,
  isDeactivated: boolean,
): void {
  if (!branchId || typeof window === 'undefined') return;
  try {
    const current = getBranchDeactivatedCategoryIds(branchId);
    if (isDeactivated) {
      current.add(String(categoryId));
    } else {
      current.delete(String(categoryId));
    }
    window.localStorage.setItem(
      `${BRANCH_DEACTIVATED_CATEGORIES_KEY_PREFIX}${branchId}`,
      JSON.stringify(Array.from(current)),
    );
  } catch {
    // ignore storage error
  }
}

const BRANCH_ITEM_OVERRIDES_KEY_PREFIX = 'hospixo_branch_item_overrides_';

export type LocalBranchItemOverride = {
  basePrice?: number;
  status?: MenuItem['status'] | 'Hidden' | '86d' | 'available' | 'hidden';
  isAvailable?: boolean;
  orderTypes?: OrderType[];
  dietary?: DietaryType;
  overrideId?: string;
  assignmentId?: string;
};

export function getBranchItemOverrides(
  branchId: string | null | undefined,
): Record<string, LocalBranchItemOverride> {
  if (!branchId || typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(`${BRANCH_ITEM_OVERRIDES_KEY_PREFIX}${branchId}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveBranchItemOverride(
  branchId: string | null | undefined,
  itemId: string,
  override: LocalBranchItemOverride,
): void {
  if (!branchId || typeof window === 'undefined') return;
  try {
    const current = getBranchItemOverrides(branchId);
    current[String(itemId)] = {
      ...(current[String(itemId)] ?? {}),
      ...override,
    };
    window.localStorage.setItem(
      `${BRANCH_ITEM_OVERRIDES_KEY_PREFIX}${branchId}`,
      JSON.stringify(current),
    );
  } catch {
    // ignore storage error
  }
}
