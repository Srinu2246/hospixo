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
  code: z.string(),
});

export const menuItemPreparationStationSchema = z.object({
  id: z.number().int(),
  preparation_station_id: z.number().int(),
  default_order: z.number().int().default(0),
  preparation_station: menuItemPreparationStationRefSchema.nullable().optional(),
});

export const menuItemModifierGroupRefSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  min_select: z.number().int().default(0),
  max_select: z.number().int().default(0),
  is_required: z.boolean().default(false),
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
  code: z.string(),
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
};

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
