import { initialMockCategories, initialMockMenuItems } from '../config/mock-menu';
import type { MenuCategory, MenuItem } from '../types/menu';

export type MenuScope = 'company' | 'branch';

function categoriesStorageKey(scope: MenuScope, scopeId: string): string {
  return `hospixo_${scope}_menu_categories_${scopeId}`;
}

function itemsStorageKey(scope: MenuScope, scopeId: string): string {
  return `hospixo_${scope}_menu_items_${scopeId}`;
}

function readJson<T>(key: string): T[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function loadMenuCategories(scope: MenuScope, scopeId: string): MenuCategory[] | null {
  return readJson<MenuCategory>(categoriesStorageKey(scope, scopeId));
}

export function loadMenuItems(scope: MenuScope, scopeId: string): MenuItem[] | null {
  return readJson<MenuItem>(itemsStorageKey(scope, scopeId));
}

export function saveMenuCategories(
  scope: MenuScope,
  scopeId: string,
  categories: MenuCategory[],
): void {
  writeJson(categoriesStorageKey(scope, scopeId), categories);
}

export function saveMenuItems(scope: MenuScope, scopeId: string, items: MenuItem[]): void {
  writeJson(itemsStorageKey(scope, scopeId), items);
}

export function hasBranchMenu(branchId: string): boolean {
  const categories = loadMenuCategories('branch', branchId);
  return Boolean(categories && categories.length > 0);
}

export function importCompanyMenuToBranch(companyId: string, branchId: string): boolean {
  if (typeof window === 'undefined') return false;
  if (hasBranchMenu(branchId)) return false;

  const companyCategories = loadMenuCategories('company', companyId);
  const companyItems = loadMenuItems('company', companyId);

  const sourceCategories =
    companyCategories && companyCategories.length > 0 ? companyCategories : initialMockCategories;
  const sourceItems = companyItems && companyItems.length > 0 ? companyItems : initialMockMenuItems;

  saveMenuCategories('branch', branchId, structuredClone(sourceCategories));
  saveMenuItems('branch', branchId, structuredClone(sourceItems));
  return true;
}
