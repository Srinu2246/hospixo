import type { z } from 'zod';

import type { MenuCataloguePageScope } from '@/lib/helpers/menuBranchContext';
import { menuItemTagNameToCode } from '@/lib/helpers/menuItemTagHelpers';
import type { CreateMenuItemFormValues } from '@/lib/schemas/menu/menuCreationSchema';
import {
  createMenuItemV2BodySchema,
  createMenuItemV2ModifierOptionSchema,
  type CreateMenuItemV2Body,
  updateMenuItemV2BodySchema,
  type UpdateMenuItemV2Body,
  type UpdateMenuItemV2ImagesPayload,
} from '@/lib/schemas/menu/menuItemsSchema';
import type { MenuItemResponse } from '@/lib/schemas/menu/menuItemsSchema';
import { ApiError } from '@/services/api/types';

export type BuildCreateMenuItemV2BodyInput = Readonly<{
  values: CreateMenuItemFormValues;
  pageScope: MenuCataloguePageScope;
  branchId?: number;
  tagNameToId?: ReadonlyMap<string, number>;
  tagIdsByName?: Readonly<Record<string, number>>;
  imageFile?: File | null;
}>;

function fieldsFromMultipart(body: unknown): Record<string, string> {
  if (body instanceof FormData) {
    const record: Record<string, string> = {};
    body.forEach((value, key) => {
      if (typeof value === 'string') {
        record[key] = value;
      }
    });
    return record;
  }

  if (body && typeof body === 'object') {
    return Object.fromEntries(
      Object.entries(body as Record<string, unknown>).map(([key, value]) => [
        key,
        value == null ? '' : String(value),
      ]),
    );
  }

  return {};
}

function parseJsonField<T>(raw: string | undefined, fallback: T): T {
  if (!raw?.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const OPERATIONAL_TAG_LABELS = new Set(['set as favorite', 'set as combo']);

function moneyString(value: number): string {
  if (!Number.isFinite(value)) return '0.00';
  return value.toFixed(2);
}

function priceDeltaString(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

type ModifierOptionRow = z.infer<typeof createMenuItemV2ModifierOptionSchema>;

function dietaryTypeToApi(
  dietary: CreateMenuItemFormValues['dietaryType'],
): CreateMenuItemV2Body['item']['dietary_type'] {
  if (dietary === 'Non-Veg') return 'non_veg';
  if (dietary === 'Egg') return 'egg';
  return 'veg';
}

function parseGstRateId(gst: string | undefined): number {
  const trimmed = gst?.trim() ?? '';
  const id = Number(trimmed);
  if (!Number.isFinite(id) || id <= 0) {
    throw new ApiError('Select a valid GST rate.', 400);
  }
  return id;
}

function resolveCatalogueScope(
  pageScope: MenuCataloguePageScope,
): CreateMenuItemV2Body['item']['scope'] {
  if (pageScope === 'branch') return 'branch';
  return 'company';
}

function tagCode(name: string): string {
  return menuItemTagNameToCode(name).toLowerCase();
}

function mapTags(input: BuildCreateMenuItemV2BodyInput): CreateMenuItemV2Body['tags'] {
  const { values, tagNameToId, tagIdsByName } = input;
  const tags: CreateMenuItemV2Body['tags'] = [];
  const seenConnect = new Set<number>();

  for (const label of values.tags) {
    const key = label.trim().toLowerCase();
    if (!key || OPERATIONAL_TAG_LABELS.has(key)) continue;

    const id = tagIdsByName?.[key] ?? tagNameToId?.get(key);
    if (id != null && id > 0 && !seenConnect.has(id)) {
      seenConnect.add(id);
      tags.push({ connect: { id } });
      continue;
    }

    const name = label.trim();
    tags.push({ create: { name, code: tagCode(name) } });
  }

  return tags;
}

function mapVariants(values: CreateMenuItemFormValues): CreateMenuItemV2Body['variants'] {
  const basePrice = values.itemPrice;
  return values.variants.map((variant, index) => ({
    name: variant.name.trim(),
    price_adjustment: moneyString(variant.price - basePrice),
    display_order: index,
    is_default: index === 0,
    sku: null,
  }));
}

function mapVariantsForUpdate(
  values: CreateMenuItemFormValues,
  initialDetail: MenuItemResponse,
): UpdateMenuItemV2Body['variants'] {
  const basePrice = values.itemPrice;
  const existingIds = new Set(initialDetail.variants.map((row) => String(row.id)));

  return values.variants.map((variant, index) => {
    const numericId = Number(variant.id);
    const row = {
      name: variant.name.trim(),
      price_adjustment: moneyString(variant.price - basePrice),
      display_order: index,
      is_default: index === 0,
      sku: null as string | null,
    };
    if (Number.isFinite(numericId) && numericId > 0 && existingIds.has(variant.id)) {
      return { ...row, id: numericId };
    }
    return row;
  });
}

function mapPreparationStations(
  initialDetail: MenuItemResponse,
): UpdateMenuItemV2Body['preparation_stations'] {
  return initialDetail.preparation_stations.map((row) => ({
    preparation_station_id: row.preparation_station_id,
    default_order: row.default_order ?? 0,
  }));
}

function mapUpdateImagesPayload(
  initialDetail: MenuItemResponse,
  newImageFiles: readonly File[],
): { images: UpdateMenuItemV2ImagesPayload | undefined; files: File[] } {
  const files = [...newImageFiles];
  if (files.length === 0) {
    // Collections omitted = unchanged (do not send `images: []`).
    return { images: undefined, files };
  }

  const activeExisting = initialDetail.images.filter((image) => image.status !== 'inactive');
  const items: UpdateMenuItemV2ImagesPayload['items'] = files.map((_, uploadIndex) => ({
    upload_index: uploadIndex,
    sort_order: uploadIndex,
    is_primary: uploadIndex === 0,
  }));

  const sortedExisting = [...activeExisting].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  for (const [index, image] of sortedExisting.entries()) {
    items.push({
      id: image.id,
      sort_order: files.length + index,
      is_primary: false,
    });
  }

  return {
    images: { items },
    files,
  };
}

function mapUpdateItemScalars(values: CreateMenuItemFormValues): UpdateMenuItemV2Body['item'] {
  const categoryId = Number(values.category);
  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    throw new ApiError('Select a valid category.', 400);
  }

  const profitRaw = values.profitMargin?.trim();
  const profitParsed = profitRaw && profitRaw.length > 0 ? Number(profitRaw) : null;
  const profitMargin = profitParsed != null && Number.isFinite(profitParsed) ? profitParsed : null;

  return {
    name: values.name.trim(),
    code: values.code.trim(),
    category_id: categoryId,
    base_price: moneyString(values.itemPrice),
    dietary_type: dietaryTypeToApi(values.dietaryType),
    description: values.description?.trim() ? values.description.trim() : null,
    profit_margin_percent: profitMargin,
    sku: null,
    barcode: null,
    allow_dine_in: values.orderTypes.some((type) => type.toLowerCase().includes('dine')),
    allow_takeaway: values.orderTypes.some((type) => type.toLowerCase().includes('take')),
    allow_delivery: values.orderTypes.some((type) => type.toLowerCase().includes('deliver')),
    expose_captain_app: values.exposedIn.some((channel) =>
      channel.toLowerCase().includes('captain'),
    ),
    is_favorite: values.tags.some((t) => t.toLowerCase() === 'set as favorite'),
    is_combo: values.tags.some((t) => t.toLowerCase() === 'set as combo'),
  };
}

/**
 * One modifier group per item. Group `create.name` must be unique in the catalog (item code).
 * Option `name` / `price_delta` come from the add-on rows the user entered.
 */
function mapModifierGroups(
  modifiers: CreateMenuItemFormValues['modifiers'],
  values: Pick<CreateMenuItemFormValues, 'code' | 'name'>,
  scope: CreateMenuItemV2Body['item']['scope'],
  branchId: number | null,
): CreateMenuItemV2Body['modifier_groups'] {
  const options: ModifierOptionRow[] = [];

  for (const modifier of modifiers) {
    const optionName = modifier.name.trim();
    if (!optionName) continue;
    options.push({
      name: optionName,
      price_delta: priceDeltaString(modifier.price),
      display_order: options.length,
    });
  }

  if (options.length === 0) return [];

  const itemKey = values.code.trim() || values.name.trim();
  if (!itemKey) {
    throw new ApiError('Item code is required when add-ons are listed.', 400);
  }

  const groupName =
    scope === 'branch' && branchId != null && branchId > 0
      ? `branch-${branchId}-${itemKey}`
      : itemKey;

  return [
    {
      create: {
        name: groupName,
        min_select: 0,
        max_select: options.length,
        is_required: false,
        options,
      },
      display_order: 0,
    },
  ];
}

/** POST /v2/restaurant/menu/items — nested JSON body. */
export function buildCreateMenuItemV2Body(
  input: BuildCreateMenuItemV2BodyInput,
): CreateMenuItemV2Body {
  const { values, pageScope, branchId } = input;
  const categoryId = Number(values.category);
  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    throw new ApiError('Select a valid category.', 400);
  }

  const scope = resolveCatalogueScope(pageScope);
  const profitRaw = values.profitMargin?.trim();
  const profitParsed = profitRaw && profitRaw.length > 0 ? Number(profitRaw) : null;
  const profitMargin = profitParsed != null && Number.isFinite(profitParsed) ? profitParsed : null;

  let assignBranchId: number | null = null;
  if (scope === 'branch') {
    if (branchId == null || branchId <= 0) {
      throw new ApiError('Branch is required to create a menu item for this account.', 400);
    }
    assignBranchId = branchId;
  }

  const body: CreateMenuItemV2Body = {
    item: {
      name: values.name.trim(),
      code: values.code.trim(),
      category_id: categoryId,
      base_price: moneyString(values.itemPrice),
      dietary_type: dietaryTypeToApi(values.dietaryType),
      description: values.description?.trim() ? values.description.trim() : null,
      profit_margin_percent: profitMargin,
      sku: null,
      barcode: null,
      allow_dine_in: values.orderTypes.some((type) => type.toLowerCase().includes('dine')),
      allow_takeaway: values.orderTypes.some((type) => type.toLowerCase().includes('take')),
      allow_delivery: values.orderTypes.some((type) => type.toLowerCase().includes('deliver')),
      expose_captain_app: values.exposedIn.some((channel) =>
        channel.toLowerCase().includes('captain'),
      ),
      is_favorite: values.tags.some((t) => t.toLowerCase() === 'set as favorite'),
      is_combo: values.tags.some((t) => t.toLowerCase() === 'set as combo'),
      scope,
      assign_branch_id: assignBranchId,
    },
    taxes: [{ gst_rate_id: parseGstRateId(values.gst), is_inclusive: false }],
    preparation_stations: [],
    variants: mapVariants(values),
    tags: mapTags(input),
    modifier_groups: mapModifierGroups(values.modifiers, values, scope, assignBranchId),
    primary_image_index: 0,
    image_ids: [],
  };

  return createMenuItemV2BodySchema.parse(body);
}

/** Parse POST /v2/restaurant/menu/items from multipart form fields or JSON (mocks). */
export function parseCreateMenuItemV2RequestBody(body: unknown): CreateMenuItemV2Body {
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    const record = body as Record<string, unknown>;
    if (record.item && typeof record.item === 'object') {
      return createMenuItemV2BodySchema.parse(body);
    }
  }

  const fields = fieldsFromMultipart(body);

  const jsonBlob = fields.payload?.trim() || fields.data?.trim() || fields.body?.trim();
  if (jsonBlob) {
    return createMenuItemV2BodySchema.parse(parseJsonField(jsonBlob, {}));
  }

  const assembled: CreateMenuItemV2Body = {
    item: parseJsonField(fields.item, {
      name: '',
      code: '',
      category_id: 1,
      base_price: '0.00',
      dietary_type: 'veg',
      description: null,
      profit_margin_percent: null,
      sku: null,
      barcode: null,
      allow_dine_in: true,
      allow_takeaway: true,
      allow_delivery: true,
      expose_captain_app: true,
      is_favorite: false,
      is_combo: false,
      scope: 'company',
      assign_branch_id: null,
    }),
    taxes: parseJsonField(fields.taxes, []),
    preparation_stations: parseJsonField(fields.preparation_stations, []),
    variants: parseJsonField(fields.variants, []),
    tags: parseJsonField(fields.tags, []),
    modifier_groups: parseJsonField(fields.modifier_groups, []),
    primary_image_index: Number(fields.primary_image_index) || 0,
    image_ids: parseJsonField(fields.image_ids, []),
  };

  return createMenuItemV2BodySchema.parse(assembled);
}

/** Form field name for nested create JSON (POST /v2/restaurant/menu/items). */
export const CREATE_MENU_ITEM_V2_PAYLOAD_FIELD = 'payload';

/**
 * Multipart POST /v2/restaurant/menu/items — one JSON `payload` part + optional `images` file.
 * Backend requires `Content-Type: multipart/form-data`.
 */
export function buildCreateMenuItemV2FormData(input: BuildCreateMenuItemV2BodyInput): FormData {
  const body = buildCreateMenuItemV2Body(input);
  const form = new FormData();

  form.append(CREATE_MENU_ITEM_V2_PAYLOAD_FIELD, JSON.stringify(body));

  if (input.imageFile) {
    form.append('images', input.imageFile);
  }

  return form;
}

export type BuildUpdateMenuItemV2BodyInput = Readonly<{
  values: CreateMenuItemFormValues;
  initialDetail: MenuItemResponse;
  pageScope: MenuCataloguePageScope;
  branchId?: number;
  tagNameToId?: ReadonlyMap<string, number>;
  tagIdsByName?: Readonly<Record<string, number>>;
  imageFiles?: readonly File[];
}>;

/** PATCH /v2/restaurant/menu/items/{item_id} — nested JSON payload. */
export function buildUpdateMenuItemV2Body(
  input: BuildUpdateMenuItemV2BodyInput,
): UpdateMenuItemV2Body {
  const { values, initialDetail, pageScope, branchId } = input;
  const updatedAt = initialDetail.updated_at?.trim();
  if (!updatedAt) {
    throw new ApiError('Menu item is missing updated_at; reload and try again.', 400);
  }

  const scope = resolveCatalogueScope(pageScope);
  let assignBranchId: number | null = null;
  if (scope === 'branch') {
    if (branchId == null || branchId <= 0) {
      throw new ApiError('Branch is required to update a menu item for this account.', 400);
    }
    assignBranchId = branchId;
  }

  const { images, files: _files } = mapUpdateImagesPayload(initialDetail, input.imageFiles ?? []);
  void _files;

  const body: UpdateMenuItemV2Body = {
    expected_updated_at: updatedAt,
    item: mapUpdateItemScalars(values),
    taxes: [{ gst_rate_id: parseGstRateId(values.gst), is_inclusive: false }],
    preparation_stations: mapPreparationStations(initialDetail),
    variants: mapVariantsForUpdate(values, initialDetail),
    tags: mapTags(input),
    modifier_groups: mapModifierGroups(values.modifiers, values, scope, assignBranchId),
    ...(images != null ? { images } : {}),
  };

  return updateMenuItemV2BodySchema.parse(body);
}

/** Multipart PATCH /v2/restaurant/menu/items/{item_id}. */
export function buildUpdateMenuItemV2FormData(input: BuildUpdateMenuItemV2BodyInput): FormData {
  const body = buildUpdateMenuItemV2Body(input);
  const form = new FormData();
  form.append(CREATE_MENU_ITEM_V2_PAYLOAD_FIELD, JSON.stringify(body));

  const { files } = mapUpdateImagesPayload(input.initialDetail, input.imageFiles ?? []);
  for (const file of files) {
    form.append('images', file);
  }

  return form;
}

/** Parse PATCH /v2/restaurant/menu/items/{item_id} multipart (mocks). */
export function parseUpdateMenuItemV2RequestBody(body: unknown): UpdateMenuItemV2Body {
  const fields = fieldsFromMultipart(body);
  const jsonBlob = fields.payload?.trim();
  if (!jsonBlob) {
    throw new ApiError('Missing payload', 400);
  }
  return updateMenuItemV2BodySchema.parse(parseJsonField(jsonBlob, {}));
}
