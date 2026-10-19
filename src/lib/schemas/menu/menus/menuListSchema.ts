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

/** Flat assignment row from GET /v1/restaurant/branches/{branch_id}/menus (section QR). */
const branchMenuAssignmentDtoSchema = z.object({
  id: z.union([z.string(), z.number()]),
  branch_id: z.union([z.string(), z.number()]),
  menu_id: z.union([z.string(), z.number()]),
  menu_name: z.string().optional(),
  menu_code: z.string().optional(),
  menu_type: z.string().optional(),
  display_order: z.number().optional(),
  is_default: z.boolean().optional(),
  status: z.string().optional(),
});

const branchMenuAssignmentListPayloadSchema = z.union([
  z.array(branchMenuAssignmentDtoSchema),
  z.object({
    success: z.boolean().optional(),
    data: z.array(branchMenuAssignmentDtoSchema),
    message: z.string().optional(),
  }),
]);

export const branchMenuAssignmentSchema = z.object({
  id: z.string(),
  branchId: z.string(),
  menuId: z.string(),
  menuName: z.string().optional(),
  menuCode: z.string().optional(),
  menuType: z.string().optional(),
  displayOrder: z.number(),
  isDefault: z.boolean(),
  status: z.enum(['Active', 'Inactive']).or(z.string()),
});

export const branchMenuAssignmentListSchema = z.array(branchMenuAssignmentSchema);

export type BranchMenuAssignment = z.infer<typeof branchMenuAssignmentSchema>;

function mapBranchMenuAssignmentDto(
  raw: z.infer<typeof branchMenuAssignmentDtoSchema>,
): BranchMenuAssignment {
  const statusRaw = String(raw.status ?? 'active');
  return {
    id: String(raw.id),
    branchId: String(raw.branch_id),
    menuId: String(raw.menu_id),
    menuName: raw.menu_name,
    menuCode: raw.menu_code,
    menuType: raw.menu_type,
    displayOrder: raw.display_order ?? 0,
    isDefault: raw.is_default ?? false,
    status: statusRaw.toLowerCase() === 'active' ? 'Active' : 'Inactive',
  };
}

export function parseBranchMenuAssignmentList(payload: unknown): BranchMenuAssignment[] {
  const parsed = branchMenuAssignmentListPayloadSchema.parse(payload);
  const list = Array.isArray(parsed) ? parsed : parsed.data;
  return branchMenuAssignmentListSchema.parse(list.map(mapBranchMenuAssignmentDto));
}
