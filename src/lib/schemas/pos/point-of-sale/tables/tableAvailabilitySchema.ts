import { z } from 'zod';

import {
  type PosTableItem,
  type PosTableStatus,
} from '@/lib/schemas/pos/point-of-sale/tables/posTableViewSchema';
import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();

/** Catalog status on a table availability row. */
export const tableCatalogStatusSchema = z.enum(['active', 'inactive']);

/** Live floor occupancy from availability API. */
export const tableOccupancyStatusSchema = z.enum([
  'available',
  'occupied',
  'reserved',
  'billing',
  'cleaning',
]);

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
  status: tableCatalogStatusSchema,
  occupancy_status: tableOccupancyStatusSchema,
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

const OCCUPANCY_TO_UI: Record<z.infer<typeof tableOccupancyStatusSchema>, PosTableStatus> = {
  available: 'available',
  occupied: 'occupied',
  reserved: 'reserved',
  billing: 'billing',
  cleaning: 'cleaning',
};

/** Map availability API rows into POS floor-plan cards. */
export function mapTableAvailabilityToPosTables(
  rows: readonly TableAvailabilityRow[],
): PosTableItem[] {
  return rows
    .filter((row) => row.status !== 'inactive')
    .map((row) => {
      const status = OCCUPANCY_TO_UI[row.occupancy_status];
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
