import { z } from 'zod';

import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();

/** One row from GET /v1/branches/{branch_id}/meal-sessions */
export const mealSessionSchema = z.object({
  id: z.number().int(),
  public_id: nullableText,
  branch_id: z.number().int().optional(),
  name: z.string(),
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
