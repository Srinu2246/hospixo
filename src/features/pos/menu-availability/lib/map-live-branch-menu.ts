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

function toSafeString(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return fallback;
}

function resolveEntityId(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;
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

function resolveLocalStatus(localStatus?: string): MenuItemStatus {
  if (localStatus === 'Hidden') return 'hidden';
  if (localStatus === '86d') return '86d';
  return 'available';
}

function determineEffectiveStatus(
  local: { isAvailable?: boolean; status?: string } | undefined,
  override?: BranchMenuItemOverrideApi,
  fallbackStatus?: string,
): MenuItemStatus {
  if (local?.isAvailable !== undefined) {
    return local.isAvailable ? 'available' : '86d';
  }
  if (local?.status) {
    return resolveLocalStatus(local.status);
  }
  if (override) {
    return mapItemStatus(override.status, override.is_available);
  }
  return mapItemStatus(fallbackStatus);
}

function resolveEffectiveTrees(
  trees?: readonly (MenuTree | null | undefined)[] | null,
  singleTree?: MenuTree | null,
): MenuTree[] {
  if (trees && trees.length > 0) {
    return trees.filter(Boolean) as MenuTree[];
  }
  if (singleTree) {
    return [singleTree];
  }
  return [];
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

type OverrideIndexes = {
  byItemId: Map<string, BranchMenuItemOverrideApi>;
  byName: Map<string, BranchMenuItemOverrideApi>;
  byCode: Map<string, BranchMenuItemOverrideApi>;
};

function buildOverrideIndexes(overrides: readonly BranchMenuItemOverrideApi[]): OverrideIndexes {
  const byItemId = new Map<string, BranchMenuItemOverrideApi>();
  const byName = new Map<string, BranchMenuItemOverrideApi>();
  const byCode = new Map<string, BranchMenuItemOverrideApi>();

  for (const o of overrides) {
    const raw = o as unknown as Record<string, unknown>;
    const nested =
      raw.menu_item && typeof raw.menu_item === 'object'
        ? (raw.menu_item as Record<string, unknown>)
        : null;
    const menuItemId = resolveEntityId(o.menu_item_id ?? raw.menuItemId ?? raw.item_id);
    const overrideId = resolveEntityId(o.id ?? raw.item_override_id ?? raw.override_id);
    const nestedItemId = nested ? resolveEntityId(nested.id) : '';

    if (menuItemId) byItemId.set(menuItemId, o);
    if (overrideId) byItemId.set(overrideId, o);
    if (nestedItemId) byItemId.set(nestedItemId, o);

    const name = toSafeString(raw.name ?? nested?.name)
      .trim()
      .toLowerCase();
    const code = toSafeString(raw.code ?? nested?.code)
      .trim()
      .toLowerCase();
    if (name) byName.set(name, o);
    if (code) byCode.set(code, o);
  }

  return { byItemId, byName, byCode };
}

function lookupOverride(
  indexes: OverrideIndexes,
  itemId?: string,
  overrideId?: string,
  code?: string,
  name?: string,
): BranchMenuItemOverrideApi | undefined {
  if (itemId && indexes.byItemId.has(itemId)) return indexes.byItemId.get(itemId);
  if (overrideId && indexes.byItemId.has(overrideId)) return indexes.byItemId.get(overrideId);
  if (code && indexes.byCode.has(code.trim().toLowerCase())) {
    return indexes.byCode.get(code.trim().toLowerCase());
  }
  if (name && indexes.byName.has(name.trim().toLowerCase())) {
    return indexes.byName.get(name.trim().toLowerCase());
  }
  return undefined;
}

type ProcessingContext = {
  catalogNameById: Map<string, string>;
  categoryMap: Map<string, MenuCategory>;
  overrideIndexes: OverrideIndexes;
  localOverrides: Record<string, { isAvailable?: boolean; status?: string }>;
  items: MenuItem[];
  seenItemIds: Set<string>;
  seenNames: Set<string>;
  itemSeq: { current: number };
};

function processTreeItems(trees: readonly MenuTree[], ctx: ProcessingContext): void {
  for (const t of trees) {
    if (!t || !Array.isArray(t.categories)) continue;
    const allCategories = collectCategoryNodes(t.categories);
    for (let catIdx = 0; catIdx < allCategories.length; catIdx++) {
      const c = allCategories[catIdx];
      const resolvedCatId = resolveEntityId(c.categoryId, `cat-${catIdx + 1}`);
      const resolvedLabel =
        c.name || ctx.catalogNameById.get(resolvedCatId) || `Category ${catIdx + 1}`;

      if (!ctx.categoryMap.has(resolvedCatId)) {
        ctx.categoryMap.set(resolvedCatId, {
          id: resolvedCatId,
          label: resolvedLabel,
          enabled: c.status?.toLowerCase() !== 'inactive',
        });
      }

      for (const treeItem of c.items ?? []) {
        ctx.itemSeq.current += 1;
        const rawItem = treeItem as unknown as Record<string, unknown>;
        const rawItemId = resolveEntityId(
          treeItem.id ?? rawItem.menu_item_id ?? rawItem.item_id,
          `item-${ctx.itemSeq.current}`,
        );
        const itemName = (treeItem.name || (rawItem.item_name as string) || '').trim();

        if (rawItemId && ctx.seenItemIds.has(rawItemId)) continue;
        if (itemName && ctx.seenNames.has(itemName.toLowerCase())) continue;

        const treeOverrideId = resolveEntityId(
          rawItem.item_override_id ??
            rawItem.itemOverrideId ??
            (treeItem as { item_override_id?: unknown }).item_override_id,
        );
        const override = lookupOverride(
          ctx.overrideIndexes,
          rawItemId,
          treeOverrideId,
          treeItem.code,
          itemName,
        );

        const rawOverride = override as unknown as Record<string, unknown> | undefined;
        const overrideId =
          resolveEntityId(
            override?.id ?? rawOverride?.item_override_id ?? rawOverride?.override_id,
          ) || treeOverrideId;

        const effectiveId =
          overrideId || rawItemId || `item-${resolvedCatId}-${ctx.itemSeq.current}`;

        const local =
          ctx.localOverrides[rawItemId] ??
          (overrideId ? ctx.localOverrides[overrideId] : undefined);
        const effectiveStatus = determineEffectiveStatus(local, override, treeItem.status);

        if (rawItemId) ctx.seenItemIds.add(rawItemId);
        if (overrideId) ctx.seenItemIds.add(overrideId);
        if (itemName) ctx.seenNames.add(itemName.toLowerCase());

        ctx.items.push({
          id: effectiveId,
          overrideId: overrideId || undefined,
          menuItemId: rawItemId,
          name: itemName || `Item #${ctx.itemSeq.current}`,
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
}

function processRemainingOverrides(
  overrides: readonly BranchMenuItemOverrideApi[],
  ctx: ProcessingContext,
): void {
  for (const o of overrides) {
    const raw = o as unknown as Record<string, unknown>;
    const nested =
      raw.menu_item && typeof raw.menu_item === 'object'
        ? (raw.menu_item as Record<string, unknown>)
        : null;
    const menuItemId = resolveEntityId(o.menu_item_id ?? raw.menuItemId ?? raw.item_id);
    const overrideId = resolveEntityId(o.id ?? raw.item_override_id ?? raw.override_id);
    const name = toSafeString(
      o.menu_item?.name ?? nested?.name ?? raw.name ?? raw.item_name,
    ).trim();

    if (menuItemId && ctx.seenItemIds.has(menuItemId)) continue;
    if (overrideId && ctx.seenItemIds.has(overrideId)) continue;
    if (name && ctx.seenNames.has(name.toLowerCase())) continue;

    ctx.itemSeq.current += 1;
    const code = toSafeString(
      o.menu_item?.code ?? nested?.code ?? raw.code ?? raw.item_code,
    ).trim();
    const catId = resolveEntityId(
      o.menu_item?.category_id ?? nested?.category_id ?? raw.category_id ?? raw.categoryId,
      'general',
    );
    if (!ctx.categoryMap.has(catId)) {
      const catName = ctx.catalogNameById.get(catId) || `Category ${catId}`;
      ctx.categoryMap.set(catId, { id: catId, label: catName, enabled: true });
    }

    const local =
      ctx.localOverrides[menuItemId] ?? (overrideId ? ctx.localOverrides[overrideId] : undefined);
    const status = determineEffectiveStatus(local, o);

    const effectiveId = overrideId || menuItemId || `item-${catId}-${ctx.itemSeq.current}`;
    if (menuItemId) ctx.seenItemIds.add(menuItemId);
    if (overrideId) ctx.seenItemIds.add(overrideId);
    if (name) ctx.seenNames.add(name.toLowerCase());

    ctx.items.push({
      id: effectiveId,
      overrideId: overrideId || undefined,
      menuItemId: menuItemId || undefined,
      name: name || `Item #${ctx.itemSeq.current}`,
      categoryId: catId,
      tags: code ? [code] : [],
      diet: inferDiet(
        name,
        code,
        o.menu_item?.dietary_type ?? toSafeString(nested?.dietary_type ?? raw.dietary_type),
      ),
      status,
      visibility: status === 'hidden' ? 'Hidden' : 'All',
      channels: ['all'],
      surfaces: ['all', 'online', 'dinein_qr'],
    });
  }
}

function processMasterItems(
  masterItems: ReadonlyArray<Record<string, unknown>>,
  branchId: string | null,
  ctx: ProcessingContext,
): void {
  for (const master of masterItems) {
    const masterScope = toSafeString(master.scope);
    const masterBranchId = toSafeString(master.assignBranchId ?? master.assign_branch_id);
    if (branchId && masterScope === 'branch' && masterBranchId !== branchId) {
      continue;
    }

    const masterId = resolveEntityId(master.id);
    const masterName = toSafeString(master.name).trim();
    const masterCode = toSafeString(master.code).trim();

    if (masterId && ctx.seenItemIds.has(masterId)) continue;
    if (masterName && ctx.seenNames.has(masterName.toLowerCase())) continue;

    ctx.itemSeq.current += 1;
    const override = lookupOverride(
      ctx.overrideIndexes,
      masterId,
      undefined,
      masterCode,
      masterName,
    );

    const rawOverride = override as unknown as Record<string, unknown> | undefined;
    const overrideId = resolveEntityId(
      override?.id ?? rawOverride?.item_override_id ?? rawOverride?.override_id,
    );
    const effectiveId = overrideId || masterId || `item-catalog-${ctx.itemSeq.current}`;

    const local =
      (masterId ? ctx.localOverrides[masterId] : undefined) ??
      (overrideId ? ctx.localOverrides[overrideId] : undefined) ??
      (masterCode ? ctx.localOverrides[masterCode] : undefined);

    const effectiveStatus = determineEffectiveStatus(
      local,
      override,
      toSafeString(master.status, 'active'),
    );

    const catId = resolveEntityId(
      override?.menu_item?.category_id ?? master.categoryId ?? master.category_id,
      'beverages',
    );
    if (!ctx.categoryMap.has(catId)) {
      const catLabel =
        ctx.catalogNameById.get(catId) ||
        toSafeString(master.categoryName ?? master.category_name) ||
        (catId === 'beverages' ? 'Beverages' : `Category ${catId}`);
      ctx.categoryMap.set(catId, { id: catId, label: catLabel, enabled: true });
    }

    if (masterId) ctx.seenItemIds.add(masterId);
    if (overrideId) ctx.seenItemIds.add(overrideId);
    if (masterName) ctx.seenNames.add(masterName.toLowerCase());

    ctx.items.push({
      id: effectiveId,
      overrideId: overrideId || undefined,
      menuItemId: masterId || undefined,
      name: masterName || `Item #${ctx.itemSeq.current}`,
      categoryId: catId,
      tags: masterCode ? [masterCode] : [],
      diet: inferDiet(
        masterName,
        masterCode,
        toSafeString(master.dietary ?? master.dietary_type) || override?.menu_item?.dietary_type,
      ),
      status: effectiveStatus,
      visibility: effectiveStatus === 'hidden' ? 'Hidden' : 'All',
      channels: ['all'],
      surfaces: ['all', 'online', 'dinein_qr'],
    });
  }
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
  const branchId = params.branchId != null ? String(params.branchId) : null;
  const localOverrides = branchId ? getBranchItemOverrides(branchId) : {};

  const catalogNameById = new Map<string, string>();
  for (const cat of categoryCatalog) {
    if (cat?.id != null && cat?.name) {
      catalogNameById.set(String(cat.id), String(cat.name));
    }
  }

  const ctx: ProcessingContext = {
    catalogNameById,
    categoryMap: new Map<string, MenuCategory>(),
    overrideIndexes: buildOverrideIndexes(overrides),
    localOverrides,
    items: [],
    seenItemIds: new Set<string>(),
    seenNames: new Set<string>(),
    itemSeq: { current: 0 },
  };

  const effectiveTrees = resolveEffectiveTrees(params.trees, params.tree);
  processTreeItems(effectiveTrees, ctx);
  processRemainingOverrides(overrides, ctx);
  processMasterItems(masterItems, branchId, ctx);

  const categories = Array.from(ctx.categoryMap.values());
  if (ctx.items.length > 0 || categories.length > 0) {
    return { categories, items: ctx.items, source: 'live' };
  }

  return {
    categories: [...menuPreviewCategories],
    items: [...menuPreviewItems],
    source: 'fixture',
  };
}
