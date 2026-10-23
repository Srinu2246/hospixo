import { z } from 'zod';

import { catalogueScopeSchema, statusBasicSchema } from '@/lib/schemas/menu/menuCategoriesSchema';
import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();

/** Menu item tag definition from POST /v1/restaurant/menu/item-tags */
export const menuItemTagDefinitionSchema = z.object({
  id: z.number().int(),
  organization_id: z.number().int().optional(),
  company_id: z.number().int().optional(),
  catalogue_scope: catalogueScopeSchema.optional(),
  branch_id: z.number().int().nullable().optional(),
  name: z.string().min(1),
  code: z.string().min(1),
  status: z.enum(['active', 'inactive']).optional(),
  created_at: nullableText,
  updated_at: nullableText,
});

export const pagedMenuItemTagsDataSchema = z.object({
  items: z.array(menuItemTagDefinitionSchema),
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

export const menuItemTagsListEnvelopeSchema = envelope(pagedMenuItemTagsDataSchema);
const menuItemTagDetailEnvelopeSchema = envelope(menuItemTagDefinitionSchema);

/** POST /v1/restaurant/menu/item-tags — company omits scope / assign_branch_id */
export const createMenuItemTagBodySchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  scope: catalogueScopeSchema.optional(),
  assign_branch_id: z.number().int().positive().optional(),
});

export type MenuItemTagDefinition = z.infer<typeof menuItemTagDefinitionSchema>;
export type PagedMenuItemTagsData = z.infer<typeof pagedMenuItemTagsDataSchema>;
export type CreateMenuItemTagBody = z.infer<typeof createMenuItemTagBodySchema>;

export type MenuItemTagListParams = {
  status?: z.infer<typeof statusBasicSchema>;
  page?: number;
  page_size?: number;
};

export function parseMenuItemTagList(payload: unknown): PagedMenuItemTagsData {
  const parsed = menuItemTagsListEnvelopeSchema.safeParse(payload);
  if (parsed.success && parsed.data.success && parsed.data.data) {
    return parsed.data.data;
  }

  const direct = pagedMenuItemTagsDataSchema.safeParse(payload);
  if (direct.success) return direct.data;

  throw new ApiError('Unexpected menu item tags response', 502);
}

export function parseMenuItemTagRecord(payload: unknown): MenuItemTagDefinition {
  const parsed = menuItemTagDetailEnvelopeSchema.safeParse(payload);
  if (parsed.success && parsed.data.success && parsed.data.data) {
    return parsed.data.data;
  }

  const direct = menuItemTagDefinitionSchema.safeParse(payload);
  if (direct.success) return direct.data;

  throw new ApiError('Unexpected menu item tag response', 502);
}
