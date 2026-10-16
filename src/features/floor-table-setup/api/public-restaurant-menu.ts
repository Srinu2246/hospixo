/**
 * Browser → platform BFF for public guest menu.
 */

import { z } from 'zod';

import type {
  PublicRestaurantMenuData,
  PublicRestaurantMenuQuery,
} from '@/features/floor-table-setup/types/public-restaurant-menu';

const modifierOptionSchema = z.object({
  name: z.string(),
  effective_price_delta: z.number(),
  display_order: z.number(),
});

const modifierGroupSchema = z.object({
  name: z.string(),
  min_select: z.number(),
  max_select: z.number(),
  is_required: z.boolean(),
  display_order: z.number(),
  options: z.array(modifierOptionSchema),
});

const variantSchema = z.object({
  name: z.string(),
  is_default: z.boolean(),
  effective_final_price: z.number(),
  display_order: z.number(),
});

const imageSchema = z.object({
  url: z.string(),
  mime_type: z.string(),
  sort_order: z.number(),
  is_primary: z.boolean(),
});

const itemSchema = z.object({
  name: z.string(),
  description: z.string(),
  dietary_type: z.enum(['veg', 'non_veg', 'egg', 'vegan']),
  effective_price: z.number(),
  variants: z.array(variantSchema),
  modifier_groups: z.array(modifierGroupSchema),
  images: z.array(imageSchema),
});

const categorySchema = z.object({
  name: z.string(),
  description: z.string(),
  display_order: z.number(),
  items: z.array(itemSchema),
});

const publicRestaurantMenuDataSchema = z.object({
  location: z.object({
    branch_name: z.string(),
    floor_name: z.string(),
    section_name: z.string(),
  }),
  menu: z.object({
    name: z.string(),
    description: z.string(),
  }),
  currency: z.string(),
  categories: z.array(categorySchema),
});

const envelopeSchema = z.object({
  success: z.literal(true),
  data: publicRestaurantMenuDataSchema,
  message: z.string().optional(),
});

function buildQueryString(query: PublicRestaurantMenuQuery): string {
  const params = new URLSearchParams({
    floor_id: String(query.floor_id),
    section_id: String(query.section_id),
    branch_id: String(query.branch_id),
    menu_id: String(query.menu_id),
  });
  return params.toString();
}

/** GET /api/public/restaurant/menu */
export async function fetchPublicRestaurantMenuClient(
  query: PublicRestaurantMenuQuery,
): Promise<PublicRestaurantMenuData> {
  const res = await fetch(`/api/public/restaurant/menu?${buildQueryString(query)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  });

  const json: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json && typeof json === 'object' && 'message' in json && typeof json.message === 'string'
        ? json.message
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  const parsed = envelopeSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('Invalid public menu response.');
  }

  return parsed.data.data;
}

export function isPublicRestaurantMenuQueryComplete(
  query: Partial<PublicRestaurantMenuQuery>,
): query is PublicRestaurantMenuQuery {
  return (
    query.floor_id != null &&
    query.floor_id > 0 &&
    query.section_id != null &&
    query.section_id > 0 &&
    query.branch_id != null &&
    query.branch_id > 0 &&
    query.menu_id != null &&
    query.menu_id > 0
  );
}
