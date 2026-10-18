import { z } from 'zod';

import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();

/** Nested menu summary on a branch assignment row. */
export const menuEmbeddedSchema = z.object({
  id: z.number().int(),
  organization_id: z.number().int().optional(),
  company_id: z.number().int().optional(),
  catalogue_scope: z.string().optional(),
  branch_id: z.number().int().nullable().optional(),
  name: z.string(),
  code: nullableText,
  description: nullableText,
  menu_type: z.string().optional().default('all'),
  display_order: z.number().int().optional().default(0),
  status: z.string(),
  branch_assignment_id: z.number().int().nullable().optional(),
  created_at: nullableText,
  updated_at: nullableText,
});

/** One row from GET branch / company menus list. */
export const menuAssignmentSchema = z.object({
  id: z.number().int(),
  organization_id: z.number().int().optional(),
  company_id: z.number().int().optional(),
  branch_id: z.number().int().nullable().optional(),
  menu_id: z.number().int(),
  display_order: z.number().int().optional().default(0),
  is_default: z.boolean().optional().default(false),
  status: z.string(),
  menu: menuEmbeddedSchema,
  created_at: nullableText,
  updated_at: nullableText,
});

export const menuAssignmentListSchema = z.array(menuAssignmentSchema);

export const pagedMenusDataSchema = z.object({
  items: menuAssignmentListSchema,
  total: z.number().int().optional().default(0),
  page: z.number().int().optional().default(1),
  page_size: z.number().int().optional().default(15),
});

const envelope = <T extends z.ZodType>(data: T) =>
  z.object({
    success: z.boolean().optional(),
    data: data.nullable().optional(),
    message: nullableText,
    request_id: nullableText,
  });

export type MenuAssignment = z.infer<typeof menuAssignmentSchema>;

/**
 * Parses menus list.
 * Live shape: `{ success, data: { items, total, page, page_size } }`.
 */
export function parseMenuAssignments(payload: unknown): MenuAssignment[] {
  const paged = pagedMenusDataSchema.safeParse(payload);
  if (paged.success) return paged.data.items;

  const wrappedPaged = envelope(pagedMenusDataSchema).safeParse(payload);
  if (wrappedPaged.success && wrappedPaged.data.data) return wrappedPaged.data.data.items;

  const asArray = menuAssignmentListSchema.safeParse(payload);
  if (asArray.success) return asArray.data;

  const wrappedArray = envelope(menuAssignmentListSchema).safeParse(payload);
  if (wrappedArray.success && wrappedArray.data.data) return wrappedArray.data.data;

  throw new ApiError('Unexpected menus response', 502);
}
