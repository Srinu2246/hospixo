import { z } from 'zod';

import { catalogueScopeSchema } from '@/lib/schemas/menu/menuCategoriesSchema';
import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();

const apiEnvelope = <T extends z.ZodType>(data: T) =>
  z.object({
    success: z.boolean().optional(),
    data: data.nullable().optional(),
    message: nullableText,
    request_id: nullableText,
  });

// ——— Branch menu assignments (GET …/branches/{id}/menus) ———

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

/** One row from GET branch menus list. */
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

export type MenuAssignment = z.infer<typeof menuAssignmentSchema>;

const menuAssignmentDetailEnvelopeSchema = apiEnvelope(menuAssignmentSchema);

/** POST branch menu activate/deactivate — assignment row with nested menu. */
export function parseMenuAssignmentRecord(payload: unknown): MenuAssignment {
  const wrapped = menuAssignmentDetailEnvelopeSchema.safeParse(payload);
  if (wrapped.success && wrapped.data.data) {
    return menuAssignmentSchema.parse(wrapped.data.data);
  }

  const direct = menuAssignmentSchema.safeParse(payload);
  if (direct.success) return direct.data;

  throw new ApiError('Unexpected menu assignment response', 502);
}

/** Parses branch menus list `{ success, data: { items, … } }`. */
export function parseMenuAssignments(payload: unknown): MenuAssignment[] {
  const paged = pagedMenusDataSchema.safeParse(payload);
  if (paged.success) return paged.data.items;

  const wrappedPaged = apiEnvelope(pagedMenusDataSchema).safeParse(payload);
  if (wrappedPaged.success && wrappedPaged.data.data) return wrappedPaged.data.data.items;

  const asArray = menuAssignmentListSchema.safeParse(payload);
  if (asArray.success) return asArray.data;

  const wrappedArray = apiEnvelope(menuAssignmentListSchema).safeParse(payload);
  if (wrappedArray.success && wrappedArray.data.data) return wrappedArray.data.data;

  throw new ApiError('Unexpected menus response', 502);
}

// ——— Restaurant menu catalogue (GET/POST …/restaurant/menus) ———

export const restaurantMenuSlugSchema = z.enum([
  'breakfast',
  'lunch',
  'dinner',
  'snacks',
  'all_day',
  'all',
]);

export type RestaurantMenuSlug = z.infer<typeof restaurantMenuSlugSchema>;

/** POST /v1/restaurant/menus — company omits scope / assign_branch_id */
export const createRestaurantMenuBodySchema = z.object({
  name: z.string().trim().min(1),
  menu: restaurantMenuSlugSchema,
  code: z.string().trim().min(1),
  description: z.string().trim().optional(),
  menu_type: z.string().trim().min(1),
  display_order: z.number().int().nonnegative().optional(),
  scope: catalogueScopeSchema.optional(),
  assign_branch_id: z.number().int().positive().optional(),
});

export type CreateRestaurantMenuBody = z.infer<typeof createRestaurantMenuBodySchema>;

/** GET/POST menu row — lenient for live API. */
export const restaurantMenuRecordSchema = z.object({
  id: z.coerce.number().int(),
  organization_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  catalogue_scope: z.string().optional(),
  branch_id: z.union([z.coerce.number().int(), z.null()]).optional(),
  name: z.string(),
  menu: z.string().optional(),
  code: nullableText,
  description: nullableText,
  menu_type: z.string().optional(),
  display_order: z.coerce.number().int().optional(),
  status: z.string().optional(),
  branch_assignment_id: z.union([z.coerce.number().int(), z.null()]).optional(),
  created_at: nullableText,
  updated_at: nullableText,
});

export type RestaurantMenuRecord = z.infer<typeof restaurantMenuRecordSchema>;

export const pagedRestaurantMenusDataSchema = z.object({
  items: z.array(restaurantMenuRecordSchema),
  total: z.number().int().default(0),
  page: z.number().int().default(1),
  page_size: z.number().int().default(15),
});

export type PagedRestaurantMenusData = z.infer<typeof pagedRestaurantMenusDataSchema>;

const restaurantMenusListEnvelopeSchema = z.object({
  success: z.boolean().optional(),
  data: z.unknown().optional(),
  message: nullableText,
  request_id: nullableText,
});

const restaurantMenuDetailEnvelopeSchema = z.object({
  success: z.boolean().optional(),
  data: restaurantMenuRecordSchema.nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

function emptyPagedMenus(): PagedRestaurantMenusData {
  return { items: [], total: 0, page: 1, page_size: 15 };
}

function parsePagedMenusData(data: unknown): PagedRestaurantMenusData | null {
  const direct = pagedRestaurantMenusDataSchema.safeParse(data);
  if (direct.success) return direct.data;

  if (typeof data !== 'object' || data === null || !('items' in data)) return null;
  const record = data as Record<string, unknown>;
  if (!Array.isArray(record.items)) return null;

  const items: RestaurantMenuRecord[] = [];
  for (const row of record.items) {
    const parsed = restaurantMenuRecordSchema.safeParse(row);
    if (parsed.success) items.push(parsed.data);
  }

  return {
    items,
    total: z.coerce
      .number()
      .int()
      .catch(0)
      .parse(record.total ?? items.length),
    page: z.coerce
      .number()
      .int()
      .catch(1)
      .parse(record.page ?? 1),
    page_size: z.coerce
      .number()
      .int()
      .catch(15)
      .parse(record.page_size ?? 15),
  };
}

export function parseRestaurantMenuList(payload: unknown): PagedRestaurantMenusData {
  const wrapped = restaurantMenusListEnvelopeSchema.safeParse(payload);
  if (wrapped.success) {
    if (wrapped.data.data == null) return emptyPagedMenus();
    const paged = parsePagedMenusData(wrapped.data.data);
    if (paged) return paged;
  }

  const paged = parsePagedMenusData(payload);
  if (paged) return paged;

  const asArray = z.array(restaurantMenuRecordSchema).safeParse(payload);
  if (asArray.success) {
    return {
      items: asArray.data,
      total: asArray.data.length,
      page: 1,
      page_size: asArray.data.length || 15,
    };
  }

  throw new ApiError('Unexpected menus list response', 502);
}

export function parseRestaurantMenuRecord(payload: unknown): RestaurantMenuRecord {
  const wrapped = restaurantMenuDetailEnvelopeSchema.safeParse(payload);
  if (wrapped.success && wrapped.data.data) {
    return restaurantMenuRecordSchema.parse(wrapped.data.data);
  }

  const direct = restaurantMenuRecordSchema.safeParse(payload);
  if (direct.success) return direct.data;

  throw new ApiError('Unexpected create menu response', 502);
}

// ——— Create / edit menu session form ———

export const RESTAURANT_MENU_SLUG_OPTIONS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'all_day', label: 'All day' },
  { id: 'all', label: 'All' },
] as const satisfies ReadonlyArray<{ id: RestaurantMenuSlug; label: string }>;

export const menuSessionFormSchema = z.object({
  name: z.string().trim().min(2, 'Session name must be at least 2 characters'),
  code: z
    .string()
    .trim()
    .min(2, 'Session code must be at least 2 characters')
    .max(32, 'Session code must be at most 32 characters'),
  menu: restaurantMenuSlugSchema,
  menuType: z.string().trim().min(1, 'Menu type is required'),
  description: z.string().trim().optional().default(''),
});

export type MenuSessionFormValues = z.infer<typeof menuSessionFormSchema>;

// ——— Menu category assignments ———

export const assignMenuCategoryBodySchema = z.object({
  category_id: z.number().int().positive(),
  display_order: z.number().int().nonnegative().optional(),
});

const menuCategoryAssignmentCategorySchema = z.object({
  id: z.coerce.number().int(),
  name: z.string(),
  status: z.string().optional(),
});

export const menuCategoryAssignmentSchema = z.object({
  id: z.coerce.number().int(),
  menu_id: z.coerce.number().int(),
  category_id: z.coerce.number().int(),
  display_order: z.coerce.number().int().optional(),
  category: menuCategoryAssignmentCategorySchema.optional(),
  created_at: nullableText,
  updated_at: nullableText,
});

export type MenuCategoryAssignment = z.infer<typeof menuCategoryAssignmentSchema>;

export const pagedMenuCategoryAssignmentsDataSchema = z.object({
  items: z.array(menuCategoryAssignmentSchema),
  total: z.coerce.number().int().default(0),
  page: z.coerce.number().int().default(1),
  page_size: z.coerce.number().int().default(15),
});

export type PagedMenuCategoryAssignmentsData = z.infer<
  typeof pagedMenuCategoryAssignmentsDataSchema
>;

const categoryAssignmentListEnvelopeSchema = z.object({
  success: z.boolean().optional(),
  data: z.unknown().optional(),
  message: nullableText,
  request_id: nullableText,
});

const categoryAssignmentDetailEnvelopeSchema = z.object({
  success: z.boolean().optional(),
  data: menuCategoryAssignmentSchema.nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

function emptyPagedMenuCategoryAssignments(): PagedMenuCategoryAssignmentsData {
  return { items: [], total: 0, page: 1, page_size: 15 };
}

function parsePagedMenuCategoryAssignmentsData(
  data: unknown,
): PagedMenuCategoryAssignmentsData | null {
  const direct = pagedMenuCategoryAssignmentsDataSchema.safeParse(data);
  if (direct.success) return direct.data;

  if (typeof data !== 'object' || data === null || !('items' in data)) return null;
  const record = data as Record<string, unknown>;
  if (!Array.isArray(record.items)) return null;

  const items: MenuCategoryAssignment[] = [];
  for (const row of record.items) {
    const parsed = menuCategoryAssignmentSchema.safeParse(row);
    if (parsed.success) items.push(parsed.data);
  }

  return {
    items,
    total: z.coerce
      .number()
      .int()
      .catch(0)
      .parse(record.total ?? items.length),
    page: z.coerce
      .number()
      .int()
      .catch(1)
      .parse(record.page ?? 1),
    page_size: z.coerce
      .number()
      .int()
      .catch(15)
      .parse(record.page_size ?? 15),
  };
}

export function parseMenuCategoryAssignmentList(
  payload: unknown,
): PagedMenuCategoryAssignmentsData {
  const wrapped = categoryAssignmentListEnvelopeSchema.safeParse(payload);
  if (wrapped.success) {
    if (wrapped.data.data == null) return emptyPagedMenuCategoryAssignments();
    const paged = parsePagedMenuCategoryAssignmentsData(wrapped.data.data);
    if (paged) return paged;
  }

  const paged = parsePagedMenuCategoryAssignmentsData(payload);
  if (paged) return paged;

  const asArray = z.array(menuCategoryAssignmentSchema).safeParse(payload);
  if (asArray.success) {
    return {
      items: asArray.data,
      total: asArray.data.length,
      page: 1,
      page_size: asArray.data.length || 15,
    };
  }

  throw new ApiError('Unexpected menu category assignments response', 502);
}

export function parseMenuCategoryAssignmentRecord(payload: unknown): MenuCategoryAssignment {
  const wrapped = categoryAssignmentDetailEnvelopeSchema.safeParse(payload);
  if (wrapped.success && wrapped.data.data) {
    return menuCategoryAssignmentSchema.parse(wrapped.data.data);
  }

  const direct = menuCategoryAssignmentSchema.safeParse(payload);
  if (direct.success) return direct.data;

  throw new ApiError('Unexpected menu category assignment response', 502);
}
