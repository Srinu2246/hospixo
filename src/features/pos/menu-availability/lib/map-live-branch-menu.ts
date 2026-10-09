import type { MenuTree, MenuTreeCategory } from '@/features/menu/types/restaurant-menu';
import type { BranchMenuItemOverrideApi } from '@/features/menu/types/branch-menu-item-api';
import { getBranchItemOverrides } from '@/features/menu/lib/menu-scope';
import type {
  MenuCategory,
  MenuItem,
  MenuItemDiet,
  MenuItemStatus,
} from '@/features/pos/types/menu-availability';
import { menuPreviewCategories, menuPreviewItems } from '../config/fixture';

export type BranchAvailabilityCatalog = {
  categories: MenuCategory[];
  items: MenuItem[];
  source: 'live' | 'fixture';
};

function resolveEntityId(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  const str = String(value).trim();
  if (str === '' || str === 'undefined' || str === 'null') return fallback;
  return str;
}

function inferDiet(name: string, code?: string, dietary?: string): MenuItemDiet {
  if (dietary) {
    const d = dietary.toLowerCase().replace(/[-_ ]/g, '');
    if (d === 'nonveg') return 'non_veg';
    if (d === 'veg') return 'veg';
  }
  const haystack = `${name} ${code ?? ''}`.toLowerCase();
  if (/(chicken|mutton|fish|prawn|egg|meat|non[- ]?veg|beef|pork|seafood|bacon)/.test(haystack)) {
    return 'non_veg';
  }
  return 'veg';
}

function mapItemStatus(status?: string, isAvailable?: boolean): MenuItemStatus {
  if (isAvailable === false) return '86d';
  if (!status) return 'available';
  const norm = status.trim().toLowerCase();
  if (norm === '86d' || norm === 'eighty_sixed') return '86d';
  if (norm === 'inactive' || norm === 'hidden' || norm === 'disabled') return 'hidden';
  return 'available';
}

function collectCategoryNodes(
  categories: readonly MenuTreeCategory[],
  acc: MenuTreeCategory[] = [],
): MenuTreeCategory[] {
  for (const category of categories) {
    acc.push(category);
    if (category.children && category.children.length > 0) {
      collectCategoryNodes(category.children, acc);
    }
  }
  return acc;
}

export function mapLiveBranchMenuToCatalog(params: {
  tree?: MenuTree | null;
  trees?: readonly (MenuTree | null | undefined)[] | null;
  overrides?: readonly BranchMenuItemOverrideApi[] | null;
  categoryCatalog?: ReadonlyArray<{ id?: string | number; name?: string }> | null;
  masterItems?: ReadonlyArray<Record<string, unknown>> | null;
  branchId?: string | number | null;
}): BranchAvailabilityCatalog {
  const overrides = params.overrides ?? [];
  const categoryCatalog = params.categoryCatalog ?? [];
  const masterItems = params.masterItems ?? [];
  const branchId = params.branchId ? String(params.branchId) : null;
  const localOverrides = branchId ? getBranchItemOverrides(branchId) : {};

  const catalogNameById = new Map<string, string>();
  for (const cat of categoryCatalog) {
    if (cat?.id != null && cat?.name) {
      catalogNameById.set(String(cat.id), String(cat.name));
    }
  }

  const overrideByItemId = new Map<string, BranchMenuItemOverrideApi>();
  const overrideByName = new Map<string, BranchMenuItemOverrideApi>();
  const overrideByCode = new Map<string, BranchMenuItemOverrideApi>();

  for (const o of overrides) {
    const raw = o as unknown as Record<string, unknown>;
    const nested =
      raw.menu_item && typeof raw.menu_item === 'object'
        ? (raw.menu_item as Record<string, unknown>)
        : null;
    const menuItemId = resolveEntityId(o.menu_item_id ?? raw.menuItemId ?? raw.item_id);
    const overrideId = resolveEntityId(o.id ?? raw.item_override_id ?? raw.override_id);
    const nestedItemId = nested ? resolveEntityId(nested.id) : '';

    if (menuItemId) overrideByItemId.set(menuItemId, o);
    if (overrideId) overrideByItemId.set(overrideId, o);
    if (nestedItemId) overrideByItemId.set(nestedItemId, o);

    const name = String(raw.name ?? nested?.name ?? '')
      .trim()
      .toLowerCase();
    const code = String(raw.code ?? nested?.code ?? '')
      .trim()
      .toLowerCase();
    if (name) overrideByName.set(name, o);
    if (code) overrideByCode.set(code, o);
  }

  const categoryMap = new Map<string, MenuCategory>();
  const items: MenuItem[] = [];
  const seenItemIds = new Set<string>();
  const seenNames = new Set<string>();

  // 1. Process trees
  const effectiveTrees =
    params.trees && params.trees.length > 0
      ? (params.trees.filter(Boolean) as MenuTree[])
      : params.tree
        ? [params.tree]
        : [];

  let itemSeq = 0;
  for (const t of effectiveTrees) {
    if (!t || !Array.isArray(t.categories)) continue;
    const allCategories = collectCategoryNodes(t.categories);
    for (let catIdx = 0; catIdx < allCategories.length; catIdx++) {
      const c = allCategories[catIdx];
      const resolvedCatId = resolveEntityId(c.categoryId, `cat-${catIdx + 1}`);
      const resolvedLabel =
        c.name || catalogNameById.get(resolvedCatId) || `Category ${catIdx + 1}`;

      if (!categoryMap.has(resolvedCatId)) {
        categoryMap.set(resolvedCatId, {
          id: resolvedCatId,
          label: resolvedLabel,
          enabled: c.status?.toLowerCase() !== 'inactive',
        });
      }

      for (const treeItem of c.items ?? []) {
        itemSeq += 1;
        const rawItem = treeItem as unknown as Record<string, unknown>;
        const rawItemId = resolveEntityId(
          treeItem.id ?? rawItem.menu_item_id ?? rawItem.item_id,
          `item-${itemSeq}`,
        );
        const itemName = (treeItem.name || (rawItem.item_name as string) || '').trim();

        if (rawItemId && seenItemIds.has(rawItemId)) continue;
        if (itemName && seenNames.has(itemName.toLowerCase())) continue;

        const treeOverrideId = resolveEntityId(
          rawItem.item_override_id ??
            rawItem.itemOverrideId ??
            (treeItem as { item_override_id?: unknown }).item_override_id,
        );
        const override =
          overrideByItemId.get(rawItemId) ??
          (treeOverrideId ? overrideByItemId.get(treeOverrideId) : undefined) ??
          (treeItem.code ? overrideByCode.get(treeItem.code.trim().toLowerCase()) : undefined) ??
          (itemName ? overrideByName.get(itemName.toLowerCase()) : undefined);

        const rawOverride = override as unknown as Record<string, unknown> | undefined;
        const overrideId =
          resolveEntityId(
            override?.id ?? rawOverride?.item_override_id ?? rawOverride?.override_id,
          ) || treeOverrideId;

        const effectiveId = overrideId || rawItemId || `item-${resolvedCatId}-${itemSeq}`;

        const local =
          localOverrides[rawItemId] ?? (overrideId ? localOverrides[overrideId] : undefined);
        let effectiveStatus: MenuItemStatus;
        if (local?.isAvailable !== undefined) {
          effectiveStatus = local.isAvailable ? 'available' : '86d';
        } else if (local?.status) {
          effectiveStatus =
            (local.status as string) === 'Hidden'
              ? 'hidden'
              : (local.status as string) === '86d'
                ? '86d'
                : 'available';
        } else if (override) {
          effectiveStatus = mapItemStatus(override.status, override.is_available);
        } else {
          effectiveStatus = mapItemStatus(treeItem.status);
        }

        if (rawItemId) seenItemIds.add(rawItemId);
        if (overrideId) seenItemIds.add(overrideId);
        if (itemName) seenNames.add(itemName.toLowerCase());

        items.push({
          id: effectiveId,
          overrideId: overrideId || undefined,
          menuItemId: rawItemId,
          name: itemName || `Item #${itemSeq}`,
          categoryId: resolvedCatId,
          tags: treeItem.code ? [treeItem.code] : [],
          diet: inferDiet(
            itemName,
            treeItem.code,
            treeItem.dietary ?? override?.menu_item?.dietary_type,
          ),
          status: effectiveStatus,
          visibility: effectiveStatus === 'hidden' ? 'Hidden' : 'All',
          channels: ['all'],
          surfaces: ['all', 'online', 'dinein_qr'],
        });
      }
    }
  }

  // 2. Process overrides that were not in any tree
  for (const o of overrides) {
    const raw = o as unknown as Record<string, unknown>;
    const nested =
      raw.menu_item && typeof raw.menu_item === 'object'
        ? (raw.menu_item as Record<string, unknown>)
        : null;
    const menuItemId = resolveEntityId(o.menu_item_id ?? raw.menuItemId ?? raw.item_id);
    const overrideId = resolveEntityId(o.id ?? raw.item_override_id ?? raw.override_id);
    const name =
      o.menu_item?.name ??
      (nested?.name as string) ??
      (raw.name as string) ??
      (raw.item_name as string) ??
      '';
    const trimmedName = name.trim();

    if (menuItemId && seenItemIds.has(menuItemId)) continue;
    if (overrideId && seenItemIds.has(overrideId)) continue;
    if (trimmedName && seenNames.has(trimmedName.toLowerCase())) continue;

    itemSeq += 1;
    const code =
      o.menu_item?.code ??
      (nested?.code as string) ??
      (raw.code as string) ??
      (raw.item_code as string);
    const catId = resolveEntityId(
      o.menu_item?.category_id ?? nested?.category_id ?? raw.category_id ?? raw.categoryId,
      'general',
    );
    if (!categoryMap.has(catId)) {
      const catName = catalogNameById.get(catId) || `Category ${catId}`;
      categoryMap.set(catId, { id: catId, label: catName, enabled: true });
    }

    const local =
      localOverrides[menuItemId] ?? (overrideId ? localOverrides[overrideId] : undefined);
    let status: MenuItemStatus;
    if (local?.isAvailable !== undefined) {
      status = local.isAvailable ? 'available' : '86d';
    } else if (local?.status) {
      status =
        (local.status as string) === 'Hidden'
          ? 'hidden'
          : (local.status as string) === '86d'
            ? '86d'
            : 'available';
    } else {
      status = mapItemStatus(o.status, o.is_available);
    }

    const effectiveId = overrideId || menuItemId || `item-${catId}-${itemSeq}`;
    if (menuItemId) seenItemIds.add(menuItemId);
    if (overrideId) seenItemIds.add(overrideId);
    if (trimmedName) seenNames.add(trimmedName.toLowerCase());

    items.push({
      id: effectiveId,
      overrideId: overrideId || undefined,
      menuItemId: menuItemId || undefined,
      name: trimmedName || `Item #${itemSeq}`,
      categoryId: catId,
      tags: code ? [code] : [],
      diet: inferDiet(
        trimmedName,
        code,
        o.menu_item?.dietary_type ??
          (nested?.dietary_type as string) ??
          (raw.dietary_type as string),
      ),
      status,
      visibility: status === 'hidden' ? 'Hidden' : 'All',
      channels: ['all'],
      surfaces: ['all', 'online', 'dinein_qr'],
    });
  }

  // 3. Process master items (catalog items such as Mojito, desserts, etc.)
  for (const master of masterItems) {
    const rawMaster = master as Record<string, unknown>;
    const masterScope = rawMaster.scope as string | undefined;
    const masterBranchId = rawMaster.assignBranchId ?? rawMaster.assign_branch_id;
    if (branchId && masterScope === 'branch' && String(masterBranchId ?? '') !== branchId) {
      continue;
    }

    const masterId = resolveEntityId(rawMaster.id);
    const masterName = String(rawMaster.name ?? '').trim();
    const masterCode = String(rawMaster.code ?? '').trim();

    if (masterId && seenItemIds.has(masterId)) continue;
    if (masterName && seenNames.has(masterName.toLowerCase())) continue;

    itemSeq += 1;
    const override =
      (masterId ? overrideByItemId.get(masterId) : undefined) ??
      (masterCode ? overrideByCode.get(masterCode.toLowerCase()) : undefined) ??
      (masterName ? overrideByName.get(masterName.toLowerCase()) : undefined);

    const rawOverride = override as unknown as Record<string, unknown> | undefined;
    const overrideId = resolveEntityId(
      override?.id ?? rawOverride?.item_override_id ?? rawOverride?.override_id,
    );
    const effectiveId = overrideId || masterId || `item-catalog-${itemSeq}`;

    const local =
      (masterId ? localOverrides[masterId] : undefined) ??
      (overrideId ? localOverrides[overrideId] : undefined) ??
      (masterCode ? localOverrides[masterCode] : undefined);

    let effectiveStatus: MenuItemStatus;
    if (local?.isAvailable !== undefined) {
      effectiveStatus = local.isAvailable ? 'available' : '86d';
    } else if (local?.status) {
      effectiveStatus =
        (local.status as string) === 'Hidden'
          ? 'hidden'
          : (local.status as string) === '86d'
            ? '86d'
            : 'available';
    } else if (override) {
      effectiveStatus = mapItemStatus(override.status, override.is_available);
    } else {
      effectiveStatus = mapItemStatus(String(rawMaster.status ?? 'active'));
    }

    const catId = resolveEntityId(
      override?.menu_item?.category_id ?? rawMaster.categoryId ?? rawMaster.category_id,
      'beverages',
    );
    if (!categoryMap.has(catId)) {
      const catLabel =
        catalogNameById.get(catId) ||
        (rawMaster.categoryName as string) ||
        (rawMaster.category_name as string) ||
        (catId === 'beverages' ? 'Beverages' : `Category ${catId}`);
      categoryMap.set(catId, { id: catId, label: catLabel, enabled: true });
    }

    if (masterId) seenItemIds.add(masterId);
    if (overrideId) seenItemIds.add(overrideId);
    if (masterName) seenNames.add(masterName.toLowerCase());

    items.push({
      id: effectiveId,
      overrideId: overrideId || undefined,
      menuItemId: masterId || undefined,
      name: masterName || `Item #${itemSeq}`,
      categoryId: catId,
      tags: masterCode ? [masterCode] : [],
      diet: inferDiet(
        masterName,
        masterCode,
        (rawMaster.dietary as string) ??
          (rawMaster.dietary_type as string) ??
          override?.menu_item?.dietary_type,
      ),
      status: effectiveStatus,
      visibility: effectiveStatus === 'hidden' ? 'Hidden' : 'All',
      channels: ['all'],
      surfaces: ['all', 'online', 'dinein_qr'],
    });
  }

  const categories = Array.from(categoryMap.values());
  if (items.length > 0 || categories.length > 0) {
    return { categories, items, source: 'live' };
  }

  return {
    categories: [...menuPreviewCategories],
    items: [...menuPreviewItems],
    source: 'fixture',
  };
}
