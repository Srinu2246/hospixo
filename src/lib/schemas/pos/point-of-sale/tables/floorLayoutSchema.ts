import { z } from 'zod';

import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();

/** Section nested under a floor on the POS table floor plan. */
export const posFloorSectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: nullableText,
  is_active: z.boolean().optional(),
  table_count: z.number().optional(),
});

/** Floor catalog status. */
export const posFloorStatusSchema = z.enum(['active', 'inactive', 'archived']);

/** Floor with sections from GET /v1/branches/{branch_id}/floors. */
export const posFloorLayoutItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: nullableText,
  is_active: z.boolean().optional(),
  status: posFloorStatusSchema.optional(),
  table_count: z.number().optional(),
  sections: z.array(posFloorSectionSchema).default([]),
});

export const posFloorLayoutListSchema = z.object({
  items: z.array(posFloorLayoutItemSchema),
  total: z.number().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export const posFloorLayoutEnvelopeSchema = z.object({
  success: z.boolean(),
  data: posFloorLayoutListSchema,
  message: nullableText,
  request_id: nullableText,
});

export type PosFloorLayoutItem = z.infer<typeof posFloorLayoutItemSchema>;

/**
 * Parse GET /v1/branches/{branch_id}/floors for the POS floor / section filters.
 * Contract: `{ success, data: { items, total, … } }`.
 */
export function parsePosFloorLayout(payload: unknown): PosFloorLayoutItem[] {
  const parsed = posFloorLayoutEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected floors response', 502);
  }

  return parsed.data.data.items
    .filter((floor) => floor.is_active !== false && floor.status !== 'inactive')
    .map((floor) => ({
      ...floor,
      sections: floor.sections.filter((section) => section.is_active !== false),
    }));
}
