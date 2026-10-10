import type {
  CreateMenuItemInput,
  DietaryType,
  MenuItem,
  MenuItemModifierGroup,
  MenuItemPreparationStation,
  MenuItemTag,
} from '../types/menu';
import type {
  CreateMenuItemApiRequest,
  MenuItemApi,
  MenuItemDietaryTypeApi,
  MenuItemModifierGroupApi,
  MenuItemPreparationStationApi,
  UpdateMenuItemApiRequest,
} from '../types/menu-item-api';
import { resolveFavoriteAndComboFlags, resolveTagIds } from './menu-item-tags-map';
import { resolveMenuScopePayload } from '../lib/menu-scope';
import { formatGstPercent, toMenuItemTaxesFromGst } from './menu-gst-map';

export function fromApiDietaryType(dietary?: string | null): DietaryType {
  if (!dietary) return 'Veg';
  const norm = dietary.trim().toLowerCase().replace(/[-_ ]/g, '');
  if (norm === 'nonveg') return 'Non-Veg';
  if (norm === 'egg') return 'Egg';
  if (norm === 'vegan') return 'Vegan';
  return 'Veg';
}

export function toApiDietaryType(dietary?: string | null): MenuItemDietaryTypeApi {
  if (!dietary) return 'veg';
  const norm = dietary.trim().toLowerCase().replace(/[-_ ]/g, '');
  if (norm === 'nonveg') return 'non_veg';
  if (norm === 'egg') return 'egg';
  return 'veg';
}

const GST_PERCENT_BY_RATE_ID: Readonly<Record<number, number>> = {
  1: 5,
  2: 12,
  3: 18,
  4: 28,
};

function formatGstPercentFromTaxes(
  taxes: readonly { gst_rate_id: number }[],
  gstPercentByRateId: Readonly<Record<number, number>> = {},
): string {
  const rateId = taxes[0]?.gst_rate_id;
  if (rateId == null) return formatGstPercent('5%');
  const percent = gstPercentByRateId[rateId] ?? GST_PERCENT_BY_RATE_ID[rateId];
  return formatGstPercent(percent != null ? `${percent}%` : '5%');
}

export function parseProfitMarginPercent(value?: string): number {
  if (!value) return 100;
  const parsed = Number.parseFloat(value.replace('%', '').trim());
  return Number.isFinite(parsed) ? parsed : 100;
}

export function mapMenuItemPreparationStationsApi(
  stations?: readonly MenuItemPreparationStationApi[] | null,
): MenuItemPreparationStation[] {
  if (!Array.isArray(stations)) return [];
  return stations.map((station) => ({
    stationId: String(station.preparation_station_id),
    defaultOrder: station.default_order,
  }));
}

export function toMenuItemPreparationStationsApi(
  stations: readonly MenuItemPreparationStation[],
): MenuItemPreparationStationApi[] {
  return stations.map((station, index) => ({
    preparation_station_id: Number(station.stationId),
    default_order: station.defaultOrder || index + 1,
  }));
}

export function mapMenuItemModifierGroupsApi(
  groups?: readonly MenuItemModifierGroupApi[] | null,
): MenuItemModifierGroup[] {
  if (!Array.isArray(groups)) return [];
  return groups.map((group) => ({
    groupId: String(group.modifier_group_id),
    displayOrder: group.display_order ?? 0,
    overrideMinSelect: group.override_min_select,
    overrideMaxSelect: group.override_max_select,
  }));
}

export function toMenuItemModifierGroupsApi(
  groups: readonly MenuItemModifierGroup[],
): MenuItemModifierGroupApi[] {
  return groups.map((group, index) => ({
    modifier_group_id: Number(group.groupId),
    display_order: group.displayOrder || index + 1,
    override_min_select: group.overrideMinSelect,
    override_max_select: group.overrideMaxSelect,
  }));
}

function resolveMenuItemStatus(
  item: MenuItemApi & { is_active?: boolean | null },
): MenuItem['status'] {
  if (item.is_active === false) return 'Hidden';
  if (typeof item.status === 'string') {
    const normalized = item.status.trim().toLowerCase();
    if (normalized === 'inactive' || normalized === 'hidden' || normalized === 'disabled') {
      return 'Hidden';
    }
    if (normalized === 'out_of_stock') {
      return 'Out of Stock';
    }
    if (normalized === 'active' || normalized === 'available') {
      return 'Available';
    }
  }
  if (item.is_active === true) return 'Available';
  return 'Hidden';
}

export function unwrapMenuItemApi(data: unknown): MenuItemApi | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const record = data as Record<string, unknown>;
  if (record.item && typeof record.item === 'object' && !Array.isArray(record.item)) {
    return record.item as MenuItemApi;
  }
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data as MenuItemApi;
  }
  return record as unknown as MenuItemApi;
}

export function mapMenuItemApi(
  item: MenuItemApi,
  categoryName = '',
  tagDefinitionsById: Record<string, MenuItemTag> = {},
  branchNameById: Record<string, string> = {},
  gstPercentByRateId: Record<number, number> = {},
): MenuItem {
  const orderTypes = [
    item.allow_delivery ? 'Delivery' : null,
    item.allow_takeaway ? 'Take Away' : null,
    item.allow_dine_in ? 'Dine In' : null,
  ].filter(Boolean) as MenuItem['orderTypes'];

  const exposeIn = item.expose_captain_app ? (['Captain App'] as MenuItem['exposeIn']) : [];
  const tagIds = Array.isArray(item.tag_ids) ? item.tag_ids.map(String) : [];
  const tags = tagIds.map((id) => tagDefinitionsById[id]?.name ?? id);

  return {
    id: String(item.id),
    name: item.name,
    categoryId: String(item.category_id),
    categoryName,
    code: item.code,
    basePrice: item.base_price,
    profitMargin: `${item.profit_margin_percent ?? 10}%`,
    dietary: fromApiDietaryType(item.dietary_type),
    orderTypes,
    exposeIn,
    tagIds,
    tags,
    preparationStations: mapMenuItemPreparationStationsApi(item.preparation_stations),
    modifierGroups: mapMenuItemModifierGroupsApi(item.modifier_groups),
    description: item.description ?? undefined,
    status: resolveMenuItemStatus(item),
    gst: item.taxes?.length
      ? formatGstPercentFromTaxes(item.taxes, gstPercentByRateId)
      : formatGstPercent('5%'),
    scope: item.catalogue_scope ?? 'company',
    assignBranchId:
      item.branch_id != null && item.branch_id > 0 ? String(item.branch_id) : undefined,
    assignBranchName:
      item.branch_id != null && item.branch_id > 0
        ? branchNameById[String(item.branch_id)]
        : undefined,
    createdAt: item.created_at,
  };
}

export function mapMenuItemsApi(
  items: readonly MenuItemApi[],
  categoryNameById: Record<string, string> = {},
  tagDefinitionsById: Record<string, MenuItemTag> = {},
  branchNameById: Record<string, string> = {},
  gstPercentByRateId: Record<number, number> = {},
): MenuItem[] {
  return items.map((item) =>
    mapMenuItemApi(
      item,
      categoryNameById[String(item.category_id)] ?? '',
      tagDefinitionsById,
      branchNameById,
      gstPercentByRateId,
    ),
  );
}

export function buildTagDefinitionsById(tags: readonly MenuItemTag[]): Record<string, MenuItemTag> {
  return Object.fromEntries(tags.map((tag) => [tag.id, tag]));
}

export function toCreateMenuItemPayload(
  input: CreateMenuItemInput,
  tagDefinitions: readonly MenuItemTag[] = [],
  options: Readonly<{ gstRateId?: number | null }> = {},
): CreateMenuItemApiRequest {
  const orderTypes =
    input.orderTypes.length > 0 ? input.orderTypes : ['Delivery', 'Take Away', 'Dine In'];
  const tagIds = resolveTagIds(input.tagIds ?? []);
  const flags = resolveFavoriteAndComboFlags(input.tagIds ?? [], tagDefinitions);
  const scopePayload = resolveMenuScopePayload({
    scope: input.scope ?? 'company',
    assignBranchId: input.assignBranchId ?? null,
  });

  const parsedCatId = Number(input.categoryId);
  const category_id = Number.isFinite(parsedCatId) && parsedCatId > 0 ? parsedCatId : 1;

  return {
    name: input.name.trim(),
    code: input.code?.trim() ?? '',
    category_id,
    base_price: input.basePrice,
    profit_margin_percent: parseProfitMarginPercent(input.profitMargin),
    allow_dine_in: orderTypes.includes('Dine In'),
    allow_takeaway: orderTypes.includes('Take Away'),
    allow_delivery: orderTypes.includes('Delivery'),
    expose_captain_app: input.exposeIn?.includes('Captain App') ?? false,
    is_favorite: flags.isFavorite || (input.tags?.includes('Set As Favorite') ?? false),
    is_combo: flags.isCombo || (input.tags?.includes('Set As Combo') ?? false),
    tag_ids: tagIds,
    dietary_type: toApiDietaryType(input.dietary),
    description: input.description?.trim() || undefined,
    taxes: toMenuItemTaxesFromGst(input.gst, false, options.gstRateId),
    preparation_stations: toMenuItemPreparationStationsApi(input.preparationStations ?? []),
    modifier_groups: toMenuItemModifierGroupsApi(input.modifierGroups ?? []),
    scope: scopePayload.scope,
    assign_branch_id: scopePayload.assign_branch_id,
  };
}

type Writable<T> = { -readonly [P in keyof T]: T[P] };

function applyOrderTypeUpdates(
  payload: Writable<UpdateMenuItemApiRequest>,
  updates: Partial<CreateMenuItemInput>,
) {
  if (updates.orderTypes !== undefined) {
    payload.allow_dine_in = updates.orderTypes.includes('Dine In');
    payload.allow_takeaway = updates.orderTypes.includes('Take Away');
    payload.allow_delivery = updates.orderTypes.includes('Delivery');
  }
  if (updates.exposeIn !== undefined) {
    payload.expose_captain_app = updates.exposeIn.includes('Captain App');
  }
}

function applyTagUpdates(
  payload: Writable<UpdateMenuItemApiRequest>,
  updates: Partial<CreateMenuItemInput>,
  tagDefinitions: readonly MenuItemTag[],
) {
  if (updates.tags === undefined && updates.tagIds === undefined) return;
  const tagIds = resolveTagIds(updates.tagIds ?? []);
  const flags = resolveFavoriteAndComboFlags(updates.tagIds ?? [], tagDefinitions);
  payload.tag_ids = tagIds;
  payload.is_favorite = flags.isFavorite || Boolean(updates.tags?.includes('Set As Favorite'));
  payload.is_combo = flags.isCombo || Boolean(updates.tags?.includes('Set As Combo'));
}

export function toUpdateMenuItemPayload(
  updates: Partial<CreateMenuItemInput>,
  tagDefinitions: readonly MenuItemTag[] = [],
  options: Readonly<{ gstRateId?: number | null }> = {},
): UpdateMenuItemApiRequest {
  const payload: Writable<UpdateMenuItemApiRequest> = {};

  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.code !== undefined) payload.code = updates.code.trim();
  if (updates.categoryId !== undefined) {
    const parsedCatId = Number(updates.categoryId);
    payload.category_id = Number.isFinite(parsedCatId) && parsedCatId > 0 ? parsedCatId : 1;
  }
  if (updates.basePrice !== undefined) payload.base_price = updates.basePrice;
  if (updates.profitMargin !== undefined) {
    payload.profit_margin_percent = parseProfitMarginPercent(updates.profitMargin);
  }
  if (updates.dietary !== undefined) payload.dietary_type = toApiDietaryType(updates.dietary);
  if (updates.description !== undefined) {
    payload.description = updates.description.trim() || undefined;
  }
  applyOrderTypeUpdates(payload, updates);
  applyTagUpdates(payload, updates, tagDefinitions);
  if (updates.preparationStations !== undefined) {
    payload.preparation_stations = toMenuItemPreparationStationsApi(updates.preparationStations);
  }
  if (updates.modifierGroups !== undefined) {
    payload.modifier_groups = toMenuItemModifierGroupsApi(updates.modifierGroups);
  }
  if (updates.gst !== undefined) {
    payload.taxes = toMenuItemTaxesFromGst(updates.gst, false, options.gstRateId);
  }
  if (updates.scope !== undefined) {
    const scopePayload = resolveMenuScopePayload({
      scope: updates.scope,
      assignBranchId: updates.assignBranchId ?? null,
    });
    payload.scope = scopePayload.scope;
    payload.assign_branch_id = scopePayload.assign_branch_id;
  }

  return payload;
}

export function unwrapMenuItemList(data: unknown): MenuItemApi[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && 'items' in (data as Record<string, unknown>)) {
    return (data as { items: MenuItemApi[] }).items;
  }
  return [];
}

export function buildCategoryNameById(
  categories: readonly { id: string; name: string }[],
): Record<string, string> {
  return Object.fromEntries(categories.map((category) => [category.id, category.name]));
}

export function enrichMenuItemFromInput(
  item: MenuItem,
  input: CreateMenuItemInput,
  categoryName: string,
): MenuItem {
  return {
    ...item,
    categoryName,
    onlineDisplayName: input.onlineDisplayName?.trim() || input.name.trim(),
    dietary: input.dietary ? fromApiDietaryType(input.dietary) : item.dietary,
    profitMargin: input.profitMargin?.trim() || item.profitMargin,
    gst: input.gst?.trim(),
    tags: input.tags,
    tagIds: input.tagIds,
    variants: input.variants,
    modifiers: input.modifiers,
    preparationStations: input.preparationStations ?? item.preparationStations,
    modifierGroups: input.modifierGroups ?? item.modifierGroups,
    image: input.image,
    description: input.description?.trim() || item.description,
    orderTypes: input.orderTypes.length > 0 ? input.orderTypes : item.orderTypes,
    exposeIn: input.exposeIn ?? item.exposeIn,
  };
}
