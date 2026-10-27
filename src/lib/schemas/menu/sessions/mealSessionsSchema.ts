import { z } from 'zod';

import { sessionNameSchema } from '@/lib/schemas/menu/sessions/sessionSchema';
import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();

/** One row from GET /v1/branches/{branch_id}/meal-sessions */
export const mealSessionSchema = z.object({
  id: z.number().int(),
  public_id: nullableText,
  branch_id: z.number().int().optional(),
  name: sessionNameSchema.or(z.string()),
  start_time: nullableText,
  end_time: nullableText,
  display_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
  created_at: nullableText,
  updated_at: nullableText,
});

export type MealSession = z.infer<typeof mealSessionSchema>;

export const pagedMealSessionsDataSchema = z.object({
  items: z.array(mealSessionSchema),
  total: z.coerce.number().int().default(0),
  page: z.coerce.number().int().default(1),
  page_size: z.coerce.number().int().default(15),
});

export type PagedMealSessionsData = z.infer<typeof pagedMealSessionsDataSchema>;

export type MealSessionListParams = {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
};

export const mealSessionsEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  message: nullableText,
  request_id: nullableText,
});

function sortMealSessions(rows: MealSession[]): MealSession[] {
  return [...rows].sort((left, right) => (left.display_order ?? 0) - (right.display_order ?? 0));
}

function emptyPagedMealSessions(): PagedMealSessionsData {
  return { items: [], total: 0, page: 1, page_size: 15 };
}

export function parseMealSessions(payload: unknown): PagedMealSessionsData {
  const parsed = mealSessionsEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected meal sessions response', 502);
  }

  const data = parsed.data.data;
  if (data == null) return emptyPagedMealSessions();

  const paged = pagedMealSessionsDataSchema.safeParse(data);
  if (paged.success) {
    const items = sortMealSessions(paged.data.items);
    return { ...paged.data, items };
  }

  const asArray = z.array(mealSessionSchema).safeParse(data);
  if (asArray.success) {
    const items = sortMealSessions(asArray.data);
    return {
      items,
      total: items.length,
      page: 1,
      page_size: items.length || 15,
    };
  }

  throw new ApiError('Unexpected meal sessions response', 502);
}

const mealSessionDetailEnvelopeSchema = z.object({
  success: z.boolean(),
  data: mealSessionSchema.nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

/** POST /v1/branches/{branch_id}/meal-sessions */
export const createMealSessionBodySchema = z.object({
  name: sessionNameSchema,
  start_time: z.string().trim().min(1),
  end_time: z.string().trim().min(1),
  is_active: z.boolean(),
});

export type CreateMealSessionBody = z.infer<typeof createMealSessionBodySchema>;

/** PATCH /v1/branches/{branch_id}/meal-sessions/{session_id} */
export type UpdateMealSessionBody = CreateMealSessionBody;

/** POST /v1/branches/{branch_id}/meal-sessions — created row in `data`. */
export function parseMealSessionRecord(payload: unknown): MealSession {
  const parsed = mealSessionDetailEnvelopeSchema.safeParse(payload);
  if (parsed.success && parsed.data.success && parsed.data.data) {
    return parsed.data.data;
  }

  const direct = mealSessionSchema.safeParse(payload);
  if (direct.success) return direct.data;

  throw new ApiError('Unexpected meal session response', 502);
}
