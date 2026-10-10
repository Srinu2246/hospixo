import { listBackendGstRates, getBackendMenuCategory } from '@/lib/api/menu';
import { resolveGstRateId, resolveGstRateIdFromCatalog } from '../api/menu-gst-map';
import {
  parseProfitMarginPercent,
  toApiDietaryType,
  toMenuItemModifierGroupsApi,
  toMenuItemPreparationStationsApi,
  toUpdateMenuItemPayload,
} from '../api/menu-items-map';
import { resolveFavoriteAndComboFlags, resolveTagIds } from '../api/menu-item-tags-map';
import { resolveMenuScopePayload } from './menu-scope';
import type { GstRateApi } from '@/features/gst-rates/types/gst-rate-api';
import type { CreateMenuItemInput, MenuItemTag } from '../types/menu';
import type { CreateMenuItemApiRequest, UpdateMenuItemApiRequest } from '../types/menu-item-api';

export class MenuItemCreateValidationError extends Error {
  readonly status: number;

  constructor(message: string, status = 422) {
    super(message);
    this.name = 'MenuItemCreateValidationError';
    this.status = status;
  }
}

function unwrapGstRates(data: unknown): GstRateApi[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as GstRateApi[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['items', 'data', 'rates', 'gst_rates']) {
      if (Array.isArray(obj[key])) return obj[key] as GstRateApi[];
    }
  }
  return [];
}

function coerceGstRateId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value);
  if (value && typeof value === 'object' && 'id' in value) {
    return coerceGstRateId((value as { id: unknown }).id);
  }
  return null;
}

export async function loadCompanyGstRatesForToken(token: string): Promise<GstRateApi[]> {
  const raw = await listBackendGstRates(token, { active_only: true });
  return unwrapGstRates(raw)
    .map((rate) => {
      const id = coerceGstRateId(rate.id);
      if (id == null) return null;
      return { ...rate, id };
    })
    .filter((rate): rate is GstRateApi => rate != null);
}

async function validateCategoryAndCode(
  token: string,
  input: CreateMenuItemInput,
): Promise<{ categoryId: number; code: string }> {
  const categoryId = Number(input.categoryId);
  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    throw new MenuItemCreateValidationError('Select a valid category before saving.');
  }

  const code = input.code?.trim();
  if (!code) {
    throw new MenuItemCreateValidationError('Item code is required.');
  }

  try {
    await getBackendMenuCategory(token, String(categoryId));
  } catch {
    throw new MenuItemCreateValidationError(
      'The selected category was not found. Refresh the page and choose a category again.',
      404,
    );
  }
  return { categoryId, code };
}

async function resolveAndValidateGstRate(
  token: string,
  input: CreateMenuItemInput,
): Promise<number> {
  const gstRates = await loadCompanyGstRatesForToken(token);
  const gstRateIdFromInput = coerceGstRateId(input.gstRateId);
  const gstRateId =
    gstRateIdFromInput ??
    resolveGstRateIdFromCatalog(input.gst, gstRates) ??
    (gstRates.length === 0 ? resolveGstRateId(input.gst) : null);

  if (gstRateId == null || !Number.isFinite(gstRateId)) {
    throw new MenuItemCreateValidationError(
      'Select a valid GST rate. Add GST rates under company settings if none are listed.',
    );
  }

  const resolvedRateId = coerceGstRateId(gstRateId)!;
  if (!gstRates.some((rate) => rate.id === resolvedRateId)) {
    throw new MenuItemCreateValidationError(
      'Selected GST rate is not active. Refresh the page and choose a GST rate again.',
    );
  }
  return resolvedRateId;
}

/** Build a backend-safe create payload using live category + GST catalog data. */
export async function buildCreateMenuItemApiPayload(
  token: string,
  input: CreateMenuItemInput,
  tagDefinitions: readonly MenuItemTag[] = [],
): Promise<CreateMenuItemApiRequest> {
  const { categoryId, code } = await validateCategoryAndCode(token, input);
  const resolvedRateId = await resolveAndValidateGstRate(token, input);

  const basePrice = Number(input.basePrice);
  if (!Number.isFinite(basePrice) || basePrice < 0) {
    throw new MenuItemCreateValidationError('Valid price is required.');
  }

  const orderTypes =
    input.orderTypes.length > 0 ? input.orderTypes : ['Delivery', 'Take Away', 'Dine In'];
  const tagIds = resolveTagIds(input.tagIds ?? []);
  const flags = resolveFavoriteAndComboFlags(input.tagIds ?? [], tagDefinitions);
  const scopePayload = resolveMenuScopePayload({
    scope: input.scope ?? 'company',
    assignBranchId: input.assignBranchId ?? null,
  });

  const payload: Record<string, unknown> = {
    name: input.name.trim(),
    code,
    category_id: categoryId,
    base_price: basePrice,
    dietary_type: toApiDietaryType(input.dietary),
    taxes: [{ gst_rate_id: resolvedRateId, is_inclusive: false }],
    allow_dine_in: orderTypes.includes('Dine In'),
    allow_takeaway: orderTypes.includes('Take Away'),
    allow_delivery: orderTypes.includes('Delivery'),
    expose_captain_app: input.exposeIn?.includes('Captain App') ?? true,
    is_favorite: flags.isFavorite || (input.tags?.includes('Set As Favorite') ?? false),
    is_combo: flags.isCombo || (input.tags?.includes('Set As Combo') ?? false),
  };

  if (input.profitMargin?.trim()) {
    const margin = parseProfitMarginPercent(input.profitMargin);
    if (Number.isFinite(margin)) {
      payload.profit_margin_percent = Math.min(100, Math.max(0, margin));
    }
  }

  if (input.description?.trim()) {
    payload.description = input.description.trim();
  }

  if (tagIds.length > 0) {
    payload.tag_ids = tagIds;
  }

  const preparationStations = toMenuItemPreparationStationsApi(input.preparationStations ?? []);
  if (preparationStations.length > 0) {
    payload.preparation_stations = preparationStations;
  }

  const modifierGroups = toMenuItemModifierGroupsApi(input.modifierGroups ?? []);
  if (modifierGroups.length > 0) {
    payload.modifier_groups = modifierGroups;
  }

  if (scopePayload.scope === 'branch') {
    payload.scope = 'branch';
    if (scopePayload.assign_branch_id != null) {
      payload.assign_branch_id = scopePayload.assign_branch_id;
    }
  }

  return finalizeMenuItemApiPayloadForBackend(payload as CreateMenuItemApiRequest);
}

export async function buildUpdateMenuItemApiPayload(
  token: string,
  updates: Partial<CreateMenuItemInput>,
  tagDefinitions: readonly MenuItemTag[] = [],
): Promise<UpdateMenuItemApiRequest> {
  if (updates.code !== undefined && !updates.code.trim()) {
    throw new MenuItemCreateValidationError('Item code is required.');
  }

  if (updates.gst === undefined) {
    return toUpdateMenuItemPayload(updates, tagDefinitions);
  }

  const gstRates = await loadCompanyGstRatesForToken(token);
  const gstRateIdFromInput = coerceGstRateId(updates.gstRateId);
  const gstRateId =
    gstRateIdFromInput ??
    resolveGstRateIdFromCatalog(updates.gst, gstRates) ??
    (gstRates.length === 0 ? resolveGstRateId(updates.gst) : null);
  if (gstRateId == null || !Number.isFinite(gstRateId)) {
    throw new MenuItemCreateValidationError('Select a valid GST rate.');
  }

  const payload = toUpdateMenuItemPayload(updates, tagDefinitions, {
    gstRateId: coerceGstRateId(gstRateId)!,
  });

  const sanitizedTaxes = payload.taxes ? sanitizeMenuItemTaxes(payload.taxes) : undefined;

  return finalizeMenuItemApiPayloadForBackend({
    ...payload,
    ...(sanitizedTaxes ? { taxes: sanitizedTaxes } : {}),
  });
}

export function sanitizeMenuItemTaxes(
  taxes: readonly { gst_rate_id?: unknown; is_inclusive?: boolean }[] | undefined,
): CreateMenuItemApiRequest['taxes'] {
  if (!taxes?.length) return undefined;
  const normalized: NonNullable<CreateMenuItemApiRequest['taxes']> = [];
  for (const tax of taxes) {
    const gstRateId = coerceGstRateId(tax.gst_rate_id);
    if (gstRateId == null) continue;
    normalized.push({
      gst_rate_id: gstRateId,
      is_inclusive: Boolean(tax.is_inclusive),
    });
  }
  return normalized.length > 0 ? normalized : undefined;
}

function coercePositiveInt(value: unknown): number | null {
  const id = coerceGstRateId(value);
  if (id == null || !Number.isInteger(id)) return null;
  return id;
}

/** Drop invalid relation ids and empty arrays before POST/PATCH to the menu items API. */
export function finalizeMenuItemApiPayloadForBackend<T extends Record<string, unknown>>(
  payload: T,
): T {
  const next: Record<string, unknown> = { ...payload };

  if (Array.isArray(next.preparation_stations)) {
    const stations = next.preparation_stations
      .map((row) => {
        if (!row || typeof row !== 'object') return null;
        const stationId = coercePositiveInt(
          (row as { preparation_station_id?: unknown }).preparation_station_id,
        );
        if (stationId == null) return null;
        const defaultOrder = Number((row as { default_order?: unknown }).default_order);
        return {
          preparation_station_id: stationId,
          default_order: Number.isFinite(defaultOrder) && defaultOrder > 0 ? defaultOrder : 1,
        };
      })
      .filter(Boolean);
    if (stations.length > 0) {
      next.preparation_stations = stations;
    } else {
      delete next.preparation_stations;
    }
  }

  if (Array.isArray(next.modifier_groups)) {
    const groups = next.modifier_groups
      .map((row) => {
        if (!row || typeof row !== 'object') return null;
        const groupId = coercePositiveInt(
          (row as { modifier_group_id?: unknown }).modifier_group_id,
        );
        if (groupId == null) return null;
        const displayOrder = Number((row as { display_order?: unknown }).display_order);
        return {
          modifier_group_id: groupId,
          ...(Number.isFinite(displayOrder) && displayOrder > 0
            ? { display_order: displayOrder }
            : {}),
        };
      })
      .filter(Boolean);
    if (groups.length > 0) {
      next.modifier_groups = groups;
    } else {
      delete next.modifier_groups;
    }
  }

  if (Array.isArray(next.tag_ids)) {
    const tagIds = next.tag_ids
      .map((id) => coercePositiveInt(id))
      .filter((id): id is number => id != null);
    if (tagIds.length > 0) {
      next.tag_ids = tagIds;
    } else {
      delete next.tag_ids;
    }
  }

  if (Array.isArray(next.taxes)) {
    const sanitized = sanitizeMenuItemTaxes(
      next.taxes as Array<{ gst_rate_id?: unknown; is_inclusive?: boolean }>,
    );
    if (sanitized?.length) {
      next.taxes = sanitized;
    }
  }

  return next as T;
}
