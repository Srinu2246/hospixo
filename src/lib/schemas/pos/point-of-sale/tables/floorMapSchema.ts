import { z } from 'zod';

import type { PosTableItem, PosTableStatus } from '@/lib/mocks/pos/usePosTables.mocks';
import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();

export const posFloorMapQrSchema = z.object({
  id: z.number(),
  dining_table_id: z.number(),
  qr_token: z.string(),
  is_active: z.boolean(),
  issued_at: nullableText,
  revoked_at: nullableText,
  created_at: nullableText,
});

/** Table card on GET .../sections/{section_id}/floor-map (api.md). */
export const posFloorMapTableSchema = z.object({
  id: z.number(),
  public_id: nullableText,
  name: z.string(),
  capacity: nullableNumber,
  sort_order: nullableNumber,
  status: z.string(),
  active_qr: posFloorMapQrSchema.nullable().optional(),
  combination_id: nullableNumber,
  is_combined: z.boolean().optional(),
  combined_capacity: nullableNumber,
  member_table_ids: z.array(z.number()).optional(),
  is_occupied: z.boolean().optional().default(false),
  order_id: nullableNumber,
  order_number: nullableText,
  guest_count: nullableNumber,
  order_status: nullableText,
  kitchen_badge: nullableText,
  grand_total: nullableNumber,
  payment_status: nullableText,
});

export const posFloorMapSectionSchema = z.object({
  id: z.number(),
  public_id: nullableText,
  name: z.string(),
  code: nullableText,
  sort_order: nullableNumber,
  status: z.string().optional(),
  is_default: z.boolean().optional(),
  tables: z.array(posFloorMapTableSchema).default([]),
});

export const posFloorMapFloorSchema = z.object({
  id: z.number(),
  public_id: nullableText,
  name: z.string(),
  code: nullableText,
  sort_order: nullableNumber,
  status: z.string().optional(),
  sections: z.array(posFloorMapSectionSchema).default([]),
});

export const posFloorMapDataSchema = z.object({
  branch_id: nullableNumber,
  floors: z.array(posFloorMapFloorSchema).default([]),
});

const posFloorMapEnvelopeSchema = z.object({
  success: z.boolean(),
  data: posFloorMapDataSchema,
  message: nullableText,
  request_id: nullableText,
});

export type PosFloorMapTable = z.infer<typeof posFloorMapTableSchema>;
export type PosFloorMapData = z.infer<typeof posFloorMapDataSchema>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapFloorMapPayload(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;
  if (payload.success === true && isRecord(payload.data)) return payload;
  if (isRecord(payload.data) && Array.isArray(payload.data.floors)) {
    return { success: true, data: payload.data };
  }
  if (Array.isArray(payload.floors)) {
    return { success: true, data: payload };
  }
  return payload;
}

function mapTableStatus(table: PosFloorMapTable): PosTableStatus {
  const payment = table.payment_status?.toLowerCase() ?? '';
  const orderStatus = table.order_status?.toLowerCase() ?? '';
  const kitchen = table.kitchen_badge?.toLowerCase() ?? '';
  const recordStatus = table.status.toLowerCase();

  if (recordStatus === 'cleaning' || kitchen === 'cleaning') return 'cleaning';
  if (payment === 'billing' || payment === 'partial' || orderStatus === 'billing') return 'billing';
  if (orderStatus === 'reserved' || kitchen === 'reserved' || payment === 'reserved') {
    return 'reserved';
  }
  if (table.is_occupied) return 'occupied';
  return 'available';
}

function formatAmount(grandTotal: number | null | undefined): string | undefined {
  if (grandTotal == null || grandTotal <= 0) return undefined;
  return `Rs.${grandTotal.toLocaleString('en-IN')}`;
}

/** Map one floor-map table row into the POS table card model. */
export function mapFloorMapTableToPosItem(
  table: PosFloorMapTable,
  floorId: number,
  sectionId: number,
): PosTableItem {
  const status = mapTableStatus(table);
  return {
    id: String(table.id),
    name: table.name,
    floorId: String(floorId),
    sectionId: String(sectionId),
    status,
    amount: formatAmount(table.grand_total),
    guests: table.guest_count ?? undefined,
    message:
      status === 'available'
        ? 'Tap to open'
        : table.order_number
          ? `Order ${table.order_number}`
          : undefined,
  };
}

/** Flatten floor-map payload into POS table cards for the floor plan grid. */
export function mapPosFloorMapToTables(data: PosFloorMapData): PosTableItem[] {
  return data.floors.flatMap((floor) =>
    floor.sections.flatMap((section) =>
      section.tables
        .filter((table) => table.status.toLowerCase() !== 'inactive')
        .map((table) => mapFloorMapTableToPosItem(table, floor.id, section.id)),
    ),
  );
}

/**
 * Parse GET /v1/branches/{branch_id}/floors/{floor_id}/sections/{section_id}/floor-map.
 */
export function parsePosFloorMap(payload: unknown): PosTableItem[] {
  const parsed = posFloorMapEnvelopeSchema.safeParse(unwrapFloorMapPayload(payload));
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected floor map response', 502);
  }
  return mapPosFloorMapToTables(parsed.data.data);
}
