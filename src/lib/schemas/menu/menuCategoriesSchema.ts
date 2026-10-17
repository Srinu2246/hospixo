import { z } from 'zod';

import { ApiError } from '@/services/api/types';

export const statusBasicSchema = z.enum(['active', 'inactive']);
export const catalogueScopeSchema = z.enum(['company', 'branch']);

const nullableText = z.string().nullable().optional();
const nullableNumber = z.number().int().nullable().optional();

/** Menu category record from GET /api/v1/restaurant/menu/categories */
export const menuCategoryResponseSchema = z.object({
  id: z.number().int(),
  organization_id: z.number().int(),
  company_id: z.number().int(),
  catalogue_scope: catalogueScopeSchema,
  parent_id: nullableNumber,
  name: z.string().min(1),
  description: nullableText,
  display_order: z.number().int().default(0),
  status: statusBasicSchema,
  created_at: nullableText,
  updated_at: nullableText,
});

export const pagedMenuCategoriesDataSchema = z.object({
  items: z.array(menuCategoryResponseSchema),
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

export const menuCategoriesEnvelopeSchema = envelope(pagedMenuCategoriesDataSchema);

export const menuCategoryResponseListSchema = z.array(menuCategoryResponseSchema);

export type StatusBasic = z.infer<typeof statusBasicSchema>;
export type MenuCategoryResponse = z.infer<typeof menuCategoryResponseSchema>;
export type PagedMenuCategoriesData = z.infer<typeof pagedMenuCategoriesDataSchema>;

export type MenuCategoryListParams = {
  status?: StatusBasic;
  page?: number;
  page_size?: number;
};

export function parseMenuCategoryList(payload: unknown): PagedMenuCategoriesData {
  const parsed = menuCategoriesEnvelopeSchema.safeParse(payload);
  if (parsed.success && parsed.data.success && parsed.data.data) {
    return parsed.data.data;
  }

  // Handle direct paged data if unwrapped
  const directParsed = pagedMenuCategoriesDataSchema.safeParse(payload);
  if (directParsed.success) {
    return directParsed.data;
  }

  // Handle direct array of items
  const arrayParsed = menuCategoryResponseListSchema.safeParse(payload);
  if (arrayParsed.success) {
    return {
      items: arrayParsed.data,
      total: arrayParsed.data.length,
      page: 1,
      page_size: arrayParsed.data.length,
    };
  }

  throw new ApiError('Unexpected menu categories response', 502);
}
