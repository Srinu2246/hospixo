import { z } from 'zod';

import { catalogueScopeSchema, statusBasicSchema } from '@/lib/schemas/menu/menuCategoriesSchema';
import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();

export const dietaryTypeApiSchema = z.enum(['veg', 'non_veg', 'egg', 'vegan']);

export const menuItemGstRateSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  cgst_rate: z.number(),
  sgst_rate: z.number(),
  igst_rate: z.number(),
  total_rate: z.number(),
});

export const menuItemTaxSchema = z.object({
  id: z.number().int(),
  gst_rate_id: z.number().int(),
  is_inclusive: z.boolean(),
  gst_rate: menuItemGstRateSchema.nullable().optional(),
});

export const menuItemPreparationStationRefSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  code: nullableText,
});

export const menuItemPreparationStationSchema = z.object({
  id: z.number().int(),
  preparation_station_id: z.number().int(),
  default_order: z.number().int().default(0),
  preparation_station: menuItemPreparationStationRefSchema.nullable().optional(),
});

export const menuItemModifierOptionSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  price_delta: z.union([z.number(), z.string()]).optional(),
  display_order: z.number().int().optional(),
});

export const menuItemModifierGroupRefSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  min_select: z.number().int().default(0),
  max_select: z.number().int().default(0),
  is_required: z.boolean().default(false),
  options: z.array(menuItemModifierOptionSchema).optional().default([]),
});

export const menuItemModifierGroupSchema = z.object({
  id: z.number().int(),
  modifier_group_id: z.number().int(),
  override_min_select: nullableNumber,
  override_max_select: nullableNumber,
  display_order: z.number().int().default(0),
  modifier_group: menuItemModifierGroupRefSchema.nullable().optional(),
});

export const menuItemTagSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  code: nullableText,
});

export const menuItemVariantSchema = z.object({
  id: z.number().int(),
  organization_id: z.number().int(),
  company_id: z.number().int(),
  catalogue_scope: catalogueScopeSchema,
  branch_id: nullableNumber,
  item_id: z.number().int(),
  name: z.string(),
  sku: nullableText,
  price_adjustment: z.number().default(0),
  final_price: z.number().default(0),
  display_order: z.number().int().default(0),
  is_default: z.boolean().default(false),
  status: statusBasicSchema,
  created_at: nullableText,
  updated_at: nullableText,
});

export const menuItemImageSchema = z.object({
  id: z.number().int(),
  organization_id: z.number().int(),
  company_id: z.number().int(),
  branch_id: nullableNumber,
  catalogue_scope: catalogueScopeSchema,
  item_id: z.number().int(),
  storage_key: nullableText,
  url: nullableText,
  mime_type: nullableText,
  sort_order: z.number().int().default(0),
  is_primary: z.boolean().default(false),
  status: statusBasicSchema,
  created_at: nullableText,
  updated_at: nullableText,
});

/** Menu item record from GET /api/v1/restaurant/menu/items */
export const menuItemResponseSchema = z.object({
  id: z.number().int(),
  organization_id: z.number().int(),
  company_id: z.number().int(),
  catalogue_scope: catalogueScopeSchema,
  branch_id: nullableNumber,
  category_id: z.number().int(),
  taxes: z.array(menuItemTaxSchema).default([]),
  preparation_stations: z.array(menuItemPreparationStationSchema).default([]),
  modifier_groups: z.array(menuItemModifierGroupSchema).default([]),
  name: z.string().min(1),
  code: nullableText,
  description: nullableText,
  sku: nullableText,
  barcode: nullableText,
  base_price: z.number().default(0),
  profit_margin_percent: nullableNumber,
  allow_dine_in: z.boolean().default(true),
  allow_takeaway: z.boolean().default(true),
  allow_delivery: z.boolean().default(true),
  expose_captain_app: z.boolean().default(true),
  is_favorite: z.boolean().default(false),
  is_combo: z.boolean().default(false),
  tag_ids: z.array(z.number().int()).default([]),
  tags: z.array(menuItemTagSchema).default([]),
  dietary_type: dietaryTypeApiSchema,
  status: statusBasicSchema,
  variants: z.array(menuItemVariantSchema).default([]),
  images: z.array(menuItemImageSchema).default([]),
  created_at: nullableText,
  updated_at: nullableText,
});

export const pagedMenuItemsDataSchema = z.object({
  items: z.array(menuItemResponseSchema),
  total: z.number().int().default(0),
  page: z.number().int().default(1),
  page_size: z.number().int().default(15),
});

const envelope = <T extends z.ZodType>(data: T) =>
  z.object({
    success: z.boolean(),
    data: data.nullable().optional(),
    message: nullableText,
    request_id: nullableText,
  });

export const menuItemsEnvelopeSchema = envelope(pagedMenuItemsDataSchema);
export const menuItemDetailEnvelopeSchema = envelope(menuItemResponseSchema);

export const menuItemResponseListSchema = z.array(menuItemResponseSchema);

export type DietaryTypeApi = z.infer<typeof dietaryTypeApiSchema>;
export type MenuItemResponse = z.infer<typeof menuItemResponseSchema>;
export type PagedMenuItemsData = z.infer<typeof pagedMenuItemsDataSchema>;

export type MenuItemListParams = {
  status?: z.infer<typeof statusBasicSchema>;
  category_id?: number;
  dietary_type?: DietaryTypeApi;
  page?: number;
  page_size?: number;
  /** Branch manager list filter — when set, only items for this branch are returned. */
  branch_id?: number;
};

/** POST .../items/{id}/activate | .../deactivate (branch-scoped sessions). */
export const menuItemStatusChangeBodySchema = z.object({
  branch_id: z.number().int().positive().optional(),
});

export type MenuItemStatusChangeBody = z.infer<typeof menuItemStatusChangeBodySchema>;

export function parseMenuItemList(payload: unknown): PagedMenuItemsData {
  const parsed = menuItemsEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new ApiError('Unexpected menu items response', 502);
  }
  return parsed.data.data;
}

/** GET /api/v1/restaurant/menu/items/{item_id} */
export function parseMenuItemRecord(payload: unknown): MenuItemResponse {
  const parsed = menuItemDetailEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new ApiError('Unexpected menu item response', 502);
  }
  return parsed.data.data;
}

export function isMenuItemCreatedMessage(message: string | null | undefined): boolean {
  return message?.trim().toLowerCase() === 'menu item created';
}

export function isMenuItemUpdatedMessage(message: string | null | undefined): boolean {
  return message?.trim().toLowerCase() === 'menu item updated';
}

export type CreateMenuItemMutationResult = {
  item: MenuItemResponse | null;
  message: string | null;
};

/** POST create / PATCH update — success envelopes (flat or nested `data.item`). */
export function parseMenuItemWriteResponse(payload: unknown): CreateMenuItemMutationResult {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (record.success === true) {
      const message = typeof record.message === 'string' ? record.message.trim() || null : null;
      const data = record.data;
      if (data && typeof data === 'object') {
        const dataRecord = data as Record<string, unknown>;
        const nestedItem = dataRecord.item;
        if (nestedItem && typeof nestedItem === 'object') {
          const parsedItem = menuItemResponseSchema.safeParse(nestedItem);
          if (parsedItem.success) {
            return { item: parsedItem.data, message };
          }
        }
        const parsedItem = menuItemResponseSchema.safeParse(data);
        if (parsedItem.success) {
          return { item: parsedItem.data, message };
        }
      }
      if (isMenuItemCreatedMessage(message) || isMenuItemUpdatedMessage(message) || message) {
        return { item: null, message: message ?? null };
      }
    }
  }

  return parseCreateMenuItemResponse(payload);
}

/** POST create — accepts full item body or message-only success envelopes. */
export function parseCreateMenuItemResponse(payload: unknown): CreateMenuItemMutationResult {
  const parsed = menuItemDetailEnvelopeSchema.safeParse(payload);
  if (parsed.success) {
    const envelope = parsed.data;
    if (envelope.success === false) {
      throw new ApiError(envelope.message ?? 'Failed to create menu item', 400);
    }

    const message = envelope.message?.trim() ?? null;
    if (envelope.data) {
      return { item: envelope.data, message };
    }

    if (isMenuItemCreatedMessage(message) || envelope.success === true) {
      return { item: null, message: message ?? 'Menu item created' };
    }
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const message = typeof record.message === 'string' ? record.message.trim() : null;
    if (record.success === true && isMenuItemCreatedMessage(message)) {
      return { item: null, message };
    }
  }

  return { item: parseMenuItemRecord(payload), message: null };
}

const menuItemV2MoneyString = z.string().trim().min(1);

export const createMenuItemV2ItemSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  category_id: z.number().int().positive(),
  base_price: menuItemV2MoneyString,
  dietary_type: dietaryTypeApiSchema,
  description: z.string().nullable(),
  profit_margin_percent: z.number().nullable(),
  sku: z.string().nullable(),
  barcode: z.string().nullable(),
  allow_dine_in: z.boolean(),
  allow_takeaway: z.boolean(),
  allow_delivery: z.boolean(),
  expose_captain_app: z.boolean(),
  is_favorite: z.boolean(),
  is_combo: z.boolean(),
  scope: catalogueScopeSchema,
  assign_branch_id: z.number().int().positive().nullable(),
});

export const createMenuItemV2TaxSchema = z.object({
  gst_rate_id: z.number().int().positive(),
  is_inclusive: z.boolean(),
});

export const createMenuItemV2PreparationStationSchema = z.object({
  preparation_station_id: z.number().int().positive(),
  default_order: z.number().int().nonnegative(),
});

export const createMenuItemV2VariantSchema = z.object({
  name: z.string().trim().min(1),
  price_adjustment: menuItemV2MoneyString,
  display_order: z.number().int().nonnegative(),
  is_default: z.boolean(),
  sku: z.string().nullable(),
});

export const createMenuItemV2TagCreateSchema = z.object({
  create: z.object({
    name: z.string().trim().min(1),
    code: z.string().trim().min(1),
  }),
});

export const createMenuItemV2TagConnectSchema = z.object({
  connect: z.object({
    id: z.number().int().positive(),
  }),
});

export const createMenuItemV2TagSchema = z.union([
  createMenuItemV2TagCreateSchema,
  createMenuItemV2TagConnectSchema,
]);

export const createMenuItemV2ModifierOptionSchema = z.object({
  name: z.string().trim().min(1),
  price_delta: menuItemV2MoneyString,
  display_order: z.number().int().nonnegative(),
});

export const createMenuItemV2ModifierGroupCreateSchema = z.object({
  create: z.object({
    name: z.string().trim().min(1),
    min_select: z.number().int().nonnegative(),
    max_select: z.number().int().nonnegative(),
    is_required: z.boolean(),
    options: z.array(createMenuItemV2ModifierOptionSchema),
  }),
  display_order: z.number().int().nonnegative(),
});

export const createMenuItemV2ModifierGroupConnectSchema = z.object({
  connect: z.object({
    id: z.number().int().positive(),
  }),
  override_min_select: z.number().int().nonnegative().optional(),
  override_max_select: z.number().int().nonnegative().optional(),
  display_order: z.number().int().nonnegative(),
});

export const createMenuItemV2ModifierGroupSchema = z.union([
  createMenuItemV2ModifierGroupCreateSchema,
  createMenuItemV2ModifierGroupConnectSchema,
]);

/** POST /v2/restaurant/menu/items */
export const createMenuItemV2BodySchema = z.object({
  item: createMenuItemV2ItemSchema,
  taxes: z.array(createMenuItemV2TaxSchema).min(1),
  preparation_stations: z.array(createMenuItemV2PreparationStationSchema).default([]),
  variants: z.array(createMenuItemV2VariantSchema).default([]),
  tags: z.array(createMenuItemV2TagSchema).default([]),
  modifier_groups: z.array(createMenuItemV2ModifierGroupSchema).default([]),
  primary_image_index: z.number().int().nonnegative().default(0),
  image_ids: z.array(z.number().int().positive()).default([]),
});

export type CreateMenuItemV2Body = z.infer<typeof createMenuItemV2BodySchema>;

export const updateMenuItemV2ImageExistingSchema = z.object({
  id: z.number().int().positive(),
  sort_order: z.number().int().nonnegative(),
  is_primary: z.boolean(),
});

export const updateMenuItemV2ImageUploadSchema = z.object({
  upload_index: z.number().int().nonnegative(),
  sort_order: z.number().int().nonnegative(),
  is_primary: z.boolean(),
});

export const updateMenuItemV2ImageSchema = z.union([
  updateMenuItemV2ImageExistingSchema,
  updateMenuItemV2ImageUploadSchema,
]);

/** Nested `payload.images` object (not a top-level array). */
export const updateMenuItemV2ImagesPayloadSchema = z.object({
  items: z.array(updateMenuItemV2ImageSchema).default([]),
});

export const updateMenuItemV2VariantSchema = createMenuItemV2VariantSchema.extend({
  id: z.number().int().positive().optional(),
});

/** Scalar fields for PATCH — scope / branch assignment are not changed here. */
export const updateMenuItemV2ItemSchema = createMenuItemV2ItemSchema.omit({
  scope: true,
  assign_branch_id: true,
});

/** PATCH /v2/restaurant/menu/items/{item_id} — JSON `payload` part. */
export const updateMenuItemV2BodySchema = z.object({
  expected_updated_at: z.string().trim().min(1),
  item: updateMenuItemV2ItemSchema,
  taxes: z.array(createMenuItemV2TaxSchema).min(1),
  preparation_stations: z.array(createMenuItemV2PreparationStationSchema).default([]),
  variants: z.array(updateMenuItemV2VariantSchema).default([]),
  tags: z.array(createMenuItemV2TagSchema).default([]),
  modifier_groups: z.array(createMenuItemV2ModifierGroupSchema).default([]),
  /** Omitted = unchanged. When present, full desired image set in `images.items`. */
  images: updateMenuItemV2ImagesPayloadSchema.optional(),
});

export type UpdateMenuItemV2Body = z.infer<typeof updateMenuItemV2BodySchema>;
export type UpdateMenuItemV2ImagesPayload = z.infer<typeof updateMenuItemV2ImagesPayloadSchema>;
