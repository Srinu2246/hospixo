import { z } from 'zod';

import { ApiError } from '@/services/api/types';

/** Section nested under a floor on the POS table floor plan. */
export const posFloorSectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  table_count: z.number().optional(),
});

/** Floor with sections from GET /v1/branches/{branch_id}/floors. */
export const posFloorLayoutItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable().optional(),
  floor_type: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  status: z.string().optional(),
  table_count: z.number().optional(),
  sections: z.array(posFloorSectionSchema).default([]),
});

export const posFloorLayoutListSchema = z.object({
  items: z.array(posFloorLayoutItemSchema),
  total: z.number().optional(),
});

export type PosFloorSection = z.infer<typeof posFloorSectionSchema>;
export type PosFloorLayoutItem = z.infer<typeof posFloorLayoutItemSchema>;
type PosFloorLayoutList = z.infer<typeof posFloorLayoutListSchema>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Unwrap `{ success, data }` envelopes used by the restaurant floors mock/API. */
function unwrapListPayload(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;
  if (payload.success === true && isRecord(payload.data)) return payload.data;
  if (isRecord(payload.data) && Array.isArray(payload.data.items)) return payload.data;
  return payload;
}

function isActiveFloor(floor: PosFloorLayoutItem): boolean {
  if (floor.is_active === false) return false;
  if (floor.status && floor.status !== 'active') return false;
  return true;
}

function isActiveSection(section: PosFloorSection): boolean {
  return section.is_active !== false;
}

/**
 * Parse GET /v1/branches/{branch_id}/floors for the POS floor / section filters.
 * Accepts the api.md shape `{ items, total }` and the enveloped mock response.
 */
export function parsePosFloorLayout(payload: unknown): PosFloorLayoutItem[] {
  const parsed = posFloorLayoutListSchema.safeParse(unwrapListPayload(payload));
  if (!parsed.success) {
    throw new ApiError('Unexpected floors response', 502);
  }

  return parsed.data.items.filter(isActiveFloor).map((floor) => ({
    ...floor,
    sections: floor.sections.filter(isActiveSection),
  }));
}
