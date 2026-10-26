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

export const mealSessionsEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.array(mealSessionSchema).nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

export function parseMealSessions(payload: unknown): MealSession[] {
  const parsed = mealSessionsEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new ApiError('Unexpected meal sessions response', 502);
  }
  return [...parsed.data.data].sort(
    (left, right) => (left.display_order ?? 0) - (right.display_order ?? 0),
  );
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
