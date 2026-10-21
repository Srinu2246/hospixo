import { z } from 'zod';

import type { PosTableItem, PosTableStatus } from '@/lib/mocks/pos/usePosTables.mocks';
import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();

/**
 * One row from GET /v1/branches/{branch_id}/tables/availability
 */
export const tableAvailabilityRowSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  floor_id: z.number().int(),
  floor_name: nullableText,
  section_id: z.number().int(),
  section_name: nullableText,
  /** Catalog status (e.g. active / inactive). */
  status: z.string(),
  /** Live floor occupancy — drive POS card status from this. */
  occupancy_status: z.string(),
  active_order_id: nullableNumber,
  available_for_order: z.boolean(),
  capacity: nullableNumber,
});

export type TableAvailabilityRow = z.infer<typeof tableAvailabilityRowSchema>;

export const tableAvailabilityListDataSchema = z.object({
  items: z.array(tableAvailabilityRowSchema).default([]),
  total: z.number().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export const tableAvailabilityEnvelopeSchema = z.object({
  success: z.boolean(),
  data: tableAvailabilityListDataSchema.nullable(),
  message: nullableText,
  request_id: nullableText,
});

export function parseTableAvailability(payload: unknown): TableAvailabilityRow[] {
  const parsed = tableAvailabilityEnvelopeSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new ApiError('Unexpected table availability response', 502);
  }
  return parsed.data.data.items;
}

function mapOccupancyStatus(occupancy: string): PosTableStatus {
  const raw = occupancy.toLowerCase();
  if (raw === 'available') return 'available';
  if (raw === 'reserved') return 'reserved';
  if (raw === 'billing') return 'billing';
  if (raw === 'cleaning') return 'cleaning';
  if (raw === 'occupied') return 'occupied';
  return 'occupied';
}

/** Map availability API rows into POS floor-plan cards. */
export function mapTableAvailabilityToPosTables(
  rows: readonly TableAvailabilityRow[],
): PosTableItem[] {
  return rows
    .filter((row) => row.status.toLowerCase() !== 'inactive')
    .map((row) => {
      const status = mapOccupancyStatus(row.occupancy_status);
      const hasOrder = row.active_order_id != null;

      return {
        id: String(row.id),
        name: row.name,
        floorId: String(row.floor_id),
        sectionId: String(row.section_id),
        status,
        capacity: row.capacity ?? undefined,
        orderId: hasOrder ? String(row.active_order_id) : undefined,
        message: hasOrder
          ? `Order #${row.active_order_id}`
          : row.available_for_order
            ? 'Tap to open'
            : undefined,
      };
    });
}
