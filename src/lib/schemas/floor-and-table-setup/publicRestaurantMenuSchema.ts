import { z } from 'zod';

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

export const publicRestaurantMenuDataSchema = z.object({
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

export const publicRestaurantMenuQuerySchema = z.object({
  floor_id: z.number().int().positive(),
  section_id: z.number().int().positive(),
  branch_id: z.number().int().positive(),
  menu_id: z.number().int().positive(),
});

export const publicRestaurantMenuApiResponseSchema = z.object({
  success: z.literal(true),
  data: publicRestaurantMenuDataSchema,
  message: z.string().optional(),
});

export type PublicRestaurantMenuData = z.infer<typeof publicRestaurantMenuDataSchema>;
export type PublicRestaurantMenuQuery = z.infer<typeof publicRestaurantMenuQuerySchema>;

export function parsePublicRestaurantMenuApiResponse(payload: unknown): PublicRestaurantMenuData {
  const envelope = publicRestaurantMenuApiResponseSchema.parse(payload);
  return envelope.data;
}

export function parsePartialPublicRestaurantMenuQuery(
  query: Partial<PublicRestaurantMenuQuery>,
): PublicRestaurantMenuQuery | null {
  const parsed = publicRestaurantMenuQuerySchema.safeParse(query);
  return parsed.success ? parsed.data : null;
}
