import { z } from 'zod';

import { catalogueScopeSchema } from '@/lib/schemas/menu/menuCategoriesSchema';
import { dietaryTypeApiSchema } from '@/lib/schemas/menu/menuItemsSchema';

export const menuItemTaxInputSchema = z.object({
  gst_rate_id: z.number().int().positive(),
  is_inclusive: z.boolean().default(false),
});

export const menuItemPreparationStationInputSchema = z.object({
  preparation_station_id: z.number().int().positive(),
  default_order: z.number().int().nonnegative().default(0),
});

export const menuItemModifierGroupInputSchema = z.object({
  modifier_group_id: z.number().int().positive(),
  override_min_select: z.number().int().nullable().optional(),
  override_max_select: z.number().int().nullable().optional(),
  display_order: z.number().int().nonnegative().default(0),
});

export const menuItemVariantInputSchema = z.object({
  name: z.string().trim().min(1),
  price_adjustment: z.number(),
  final_price: z.number().nonnegative(),
  display_order: z.number().int().nonnegative().default(0),
  is_default: z.boolean().default(false),
  sku: z.string().nullable().optional(),
});

/** JSON body for POST /v1/restaurant/menu/items (also sent as multipart fields). */
export const createMenuItemBodySchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  category_id: z.number().int().positive(),
  taxes: z.array(menuItemTaxInputSchema).min(1),
  preparation_stations: z.array(menuItemPreparationStationInputSchema).default([]),
  modifier_groups: z.array(menuItemModifierGroupInputSchema).default([]),
  variants: z.array(menuItemVariantInputSchema).default([]),
  tag_ids: z.array(z.number().int().positive()).default([]),
  image_ids: z.array(z.number().int().positive()).default([]),
  base_price: z.number().nonnegative(),
  profit_margin_percent: z.number().nullable().optional(),
  allow_dine_in: z.boolean().default(true),
  allow_takeaway: z.boolean().default(true),
  allow_delivery: z.boolean().default(true),
  expose_captain_app: z.boolean().default(true),
  is_favorite: z.boolean().default(false),
  is_combo: z.boolean().default(false),
  dietary_type: dietaryTypeApiSchema,
  description: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  scope: catalogueScopeSchema.optional(),
  assign_branch_id: z.number().int().positive().optional(),
});

export type CreateMenuItemBody = z.infer<typeof createMenuItemBodySchema>;
