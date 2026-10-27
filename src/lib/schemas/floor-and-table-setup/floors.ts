import { z } from 'zod';

import type {
  CatalogSection,
  CatalogTable,
  FloorSummary,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();

const floorListSectionSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  code: nullableText,
  table_count: z.number().nullish(),
  seat_count: z.number().nullish(),
});

export const floorRecordSchema = z.object({
  id: z.number(),
  public_id: nullableText,
  organization_id: nullableNumber,
  company_id: nullableNumber,
  branch_id: nullableNumber,
  name: z.string(),
  description: nullableText,
  sort_order: nullableNumber,
  status: z.string(),
  version: nullableNumber,
  archived_at: nullableText,
  archived_reason: nullableText,
  created_at: nullableText,
  updated_at: nullableText,
  code: nullableText,
});

const floorListItemSchema = floorRecordSchema.extend({
  table_count: z.number().nullish(),
  seat_count: z.number().nullish(),
  sections: z.preprocess((value) => {
    if (!Array.isArray(value)) return value;
    return value.filter(
      (item) =>
        item != null &&
        typeof item === 'object' &&
        typeof (item as { id?: unknown }).id === 'number',
    );
  }, z.array(floorListSectionSchema).nullish()),
});

export const sectionRecordSchema = floorRecordSchema.extend({
  floor_id: nullableNumber,
  is_default: z.boolean().nullable().optional(),
});

const envelope = <T extends z.ZodType>(data: T) =>
  z.object({
    success: z.boolean(),
    data,
    message: nullableText,
    request_id: nullableText,
  });

export const floorListSchema = envelope(
  z.object({
    items: z.array(floorListItemSchema),
    total: z.number(),
    page: nullableNumber,
    page_size: nullableNumber,
  }),
);

export const floorDetailSchema = envelope(floorRecordSchema);
export const sectionListSchema = envelope(
  z.object({
    items: z.array(sectionRecordSchema),
    total: z.number(),
    page: nullableNumber,
    page_size: nullableNumber,
  }),
);
export const sectionDetailSchema = envelope(sectionRecordSchema);

export const tableRecordSchema = z.object({
  id: z.number(),
  public_id: nullableText,
  organization_id: nullableNumber,
  company_id: nullableNumber,
  branch_id: nullableNumber,
  floor_id: nullableNumber,
  section_id: nullableNumber,
  name: z.string(),
  description: nullableText,
  capacity: nullableNumber,
  sort_order: nullableNumber,
  status: z.string(),
  version: nullableNumber,
  archived_at: nullableText,
  archived_reason: nullableText,
  created_at: nullableText,
  updated_at: nullableText,
});

export const tableListSchema = envelope(
  z.object({
    items: z.array(tableRecordSchema),
    total: z.number(),
    page: nullableNumber,
    page_size: nullableNumber,
  }),
);

export const tableDetailSchema = envelope(tableRecordSchema);
export const tableBulkSchema = envelope(z.array(tableRecordSchema));

const floorMapTableSchema = z.object({
  id: z.number(),
  public_id: nullableText,
  name: z.string(),
  capacity: nullableNumber,
  sort_order: nullableNumber,
  status: z.string(),
});

export const floorMapSchema = envelope(
  z.object({
    branch_id: nullableNumber,
    floors: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        sections: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            tables: z.array(floorMapTableSchema),
          }),
        ),
      }),
    ),
  }),
);

export type FloorRecord = z.infer<typeof floorRecordSchema>;
export type FloorListItem = z.infer<typeof floorListItemSchema>;
export type SectionRecord = z.infer<typeof sectionRecordSchema>;
export type TableRecord = z.infer<typeof tableRecordSchema>;

export type CreateFloorBody = {
  name: string;
  description: string;
  sort_order: number;
  code: string;
};

export type UpdateFloorBody = CreateFloorBody & {
  status: string;
  version: number;
};

export type ArchiveBody = {
  reason: string;
  version: number;
};

export type CreateSectionBody = CreateFloorBody;
export type UpdateSectionBody = UpdateFloorBody;

export type CreateTableBody = {
  name: string;
  description: string;
  capacity: number;
  sort_order: number;
};

export type UpdateTableBody = CreateTableBody & {
  status: string;
  version: number;
};

export type BulkCreateTablesBody = {
  items: CreateTableBody[];
};

export type BulkUpdateTableItem = UpdateTableBody & {
  table_id: number;
};

export type BulkUpdateTablesBody = {
  items: BulkUpdateTableItem[];
};

export type MoveTableBody = {
  floor_id: number;
  section_id: number;
  version: number;
};

export function parseFloorList(payload: unknown): FloorListItem[] {
  const parsed = floorListSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected floors response', 502);
  }
  return parsed.data.data.items;
}

export function parseFloorRecord(payload: unknown): FloorRecord {
  const parsed = floorDetailSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected floor response', 502);
  }
  return parsed.data.data;
}

export function parseSectionList(payload: unknown): SectionRecord[] {
  const parsed = sectionListSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected sections response', 502);
  }
  return parsed.data.data.items;
}

export function parseTableList(payload: unknown): TableRecord[] {
  return parseTableListPage(payload).items;
}

export function parseTableListPage(payload: unknown): { items: TableRecord[]; total: number } {
  const parsed = tableListSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected tables response', 502);
  }
  return { items: parsed.data.data.items, total: parsed.data.data.total };
}

export function parseTableRecord(payload: unknown): TableRecord {
  const parsed = tableDetailSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected table response', 502);
  }
  return parsed.data.data;
}

export function parseTableBulk(payload: unknown): TableRecord[] {
  const parsed = tableBulkSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected tables response', 502);
  }
  return parsed.data.data;
}

export function parseFloorMapTables(payload: unknown): CatalogTable[] {
  const parsed = floorMapSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    throw new ApiError('Unexpected floor map response', 502);
  }
  return parsed.data.data.floors.flatMap((floor) =>
    floor.sections.flatMap((section) =>
      section.tables.map((table) =>
        toCatalogTable(
          {
            id: table.id,
            name: table.name,
            capacity: table.capacity,
            sort_order: table.sort_order,
            status: table.status,
            section_id: section.id,
          },
          section.name,
        ),
      ),
    ),
  );
}

export function parseSectionRecord(payload: unknown): SectionRecord {
  const parsed = sectionDetailSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.success) {
    throw new ApiError('Unexpected section response', 502);
  }
  return parsed.data.data;
}

export function toFloorSummary(floor: FloorListItem): FloorSummary {
  const updated = updatedStamp(floor.updated_at);
  const sections = floor.sections ?? [];
  const sectionTables = sections.flatMap((section) =>
    typeof section.table_count === 'number' ? [section.table_count] : [],
  );
  const sectionSeats = sections.flatMap((section) =>
    typeof section.seat_count === 'number' ? [section.seat_count] : [],
  );
  return {
    id: String(floor.id),
    name: floor.name,
    code: floor.code ?? '',
    active: isActiveRecord(floor),
    tableCount:
      floor.table_count ??
      (sectionTables.length > 0 ? sectionTables.reduce((total, count) => total + count, 0) : null),
    seatCount:
      floor.seat_count ??
      (sectionSeats.length === sections.length && sections.length > 0
        ? sectionSeats.reduce((total, count) => total + count, 0)
        : null),
    updatedAt: updated.at,
    updatedLabel: updated.label,
  };
}

export function toCatalogSection(section: SectionRecord): CatalogSection {
  return {
    id: String(section.id),
    name: section.name,
    code: section.code ?? '',
    description: section.description ?? '',
    active: isActiveRecord(section),
    tableCount: 0,
    seatCount: 0,
    activeTableCount: 0,
    inactiveTableCount: 0,
    version: section.version ?? 0,
    sortOrder: section.sort_order ?? 0,
  };
}

export function toCatalogTable(
  table: {
    id: number;
    name: string;
    status: string;
    capacity?: number | null;
    sort_order?: number | null;
    section_id?: number | null;
    description?: string | null;
    version?: number | null;
    archived_at?: string | null;
  },
  area = '',
): CatalogTable {
  return {
    id: String(table.id),
    number: table.name,
    seats: table.capacity ?? 0,
    active: isActiveRecord(table),
    reservations: false,
    sectionId: table.section_id == null ? '' : String(table.section_id),
    area,
    shape: '',
    description: table.description ?? '',
    version: table.version ?? 0,
    sortOrder: table.sort_order ?? 0,
  };
}

export function isActiveRecord(record: { status: string; archived_at?: string | null }): boolean {
  return record.status === 'active' && !record.archived_at;
}

export function formatCreatedOn(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function updatedStamp(value: string | null | undefined): { at: number; label: string } {
  if (!value) return { at: 0, label: 'Updated recently' };
  const at = Date.parse(value);
  if (Number.isNaN(at)) return { at: 0, label: 'Updated recently' };

  const minutes = Math.max(1, Math.round((Date.now() - at) / 60000));
  if (minutes < 60) return { at, label: `Updated ${minutes} mins ago` };
  const hours = Math.round(minutes / 60);
  if (hours < 24) return { at, label: `Updated ${hours} hrs ago` };
  const days = Math.round(hours / 24);
  if (days < 14) return { at, label: `Updated ${days} days ago` };
  const weeks = Math.round(days / 7);
  if (weeks < 8) return { at, label: `Updated ${weeks} weeks ago` };
  return { at, label: `Updated ${Math.round(days / 30)} months ago` };
}
