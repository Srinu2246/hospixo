import { computeFloorStatsFromTables } from '@/features/floor-table-setup/lib/detail';
import { ApiRequestError } from '@/lib/api/errors';
import type {
  Floor,
  FloorDraftForm,
  FloorSection,
  FloorStatus,
  FloorTableItem,
  FloorTableStatus,
  FloorType,
  SectionStatus,
  TableConfigStatus,
  TableDraft,
  TableShape,
} from '@/features/floor-table-setup/types/floor-table-setup';
import type {
  ApiDiningTable,
  ApiFloor,
  ApiFloorMap,
  ApiFloorSection,
  BulkCreateTablesInput,
  BulkUpdateTablesInput,
  CombineTablesInput,
  CreateFloorInput,
  CreateSectionInput,
  CreateTableInput,
  MoveTableInput,
  UpdateFloorInput,
  UpdateSectionInput,
  UpdateTableInput,
} from '@/types/floors';

const FLOOR_TYPES: readonly FloorType[] = ['indoor', 'outdoor', 'vip', 'banquet'];
const FLOOR_STATUSES: readonly FloorStatus[] = ['active', 'inactive', 'draft'];
const SECTION_STATUSES: readonly SectionStatus[] = ['active', 'inactive'];
const TABLE_SHAPES: readonly TableShape[] = ['round', 'square', 'rectangle'];
const TABLE_CONFIG_STATUSES: readonly TableConfigStatus[] = ['active', 'inactive'];

function normalizeLifecycleStatus(value: unknown): 'active' | 'inactive' {
  if (value === 'inactive' || value === 'archived' || value === 'maintenance') return 'inactive';
  if (value === 'active') return 'active';
  return 'active';
}

function asFloorType(value: unknown): FloorType {
  return typeof value === 'string' && FLOOR_TYPES.includes(value as FloorType)
    ? (value as FloorType)
    : 'indoor';
}

function asFloorStatus(floor: ApiFloor): FloorStatus {
  if (typeof floor.status === 'string' && floor.status === 'draft') return 'draft';
  if (floor.is_active === false || floor.status === 'inactive' || floor.status === 'archived') {
    return 'inactive';
  }
  if (typeof floor.status === 'string' && FLOOR_STATUSES.includes(floor.status as FloorStatus)) {
    return floor.status as FloorStatus;
  }
  return 'active';
}

function asSectionStatus(section: ApiFloorSection): SectionStatus {
  if (section.status === 'archived' || section.status === 'maintenance') return 'inactive';
  if (
    typeof section.status === 'string' &&
    SECTION_STATUSES.includes(section.status as SectionStatus)
  ) {
    return section.status as SectionStatus;
  }
  return section.is_active === false ? 'inactive' : 'active';
}

function createdByLabel(value: ApiFloor['created_by']): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object') {
    const name = [value.first_name, value.last_name].filter(Boolean).join(' ').trim();
    if (name) return name;
  }
  return '';
}

type ApiSectionWithTables = ApiFloorSection &
  Readonly<{
    tables?: readonly ApiDiningTable[] | null;
    is_default?: boolean | null;
  }>;

export function resolveApiSectionId(section: ApiFloorSection): string | null {
  const id = section.id ?? section.section_id;
  if (id == null || id === '') return null;
  return String(id);
}

export function enrichApiSectionsWithTableStats(
  sectionItems: readonly ApiFloorSection[],
  tables: readonly Pick<FloorTableItem, 'sectionId' | 'capacity'>[],
): ApiFloorSection[] {
  return sectionItems.map((section) => {
    const sectionId = resolveApiSectionId(section);
    if (!sectionId) return section;

    const sectionTables = tables.filter((table) => table.sectionId === sectionId);
    if (sectionTables.length === 0) return section;

    return {
      ...section,
      table_count: sectionTables.length,
      seat_count: sectionTables.reduce((sum, table) => sum + table.capacity, 0),
    };
  });
}

export function mapApiSectionToSection(section: ApiFloorSection, index = 0): FloorSection {
  const apiSection = section as ApiSectionWithTables;
  return {
    id: resolveApiSectionId(section) ?? `section-${index + 1}`,
    name: section.name,
    code: section.code ?? undefined,
    description: section.description ?? undefined,
    status: asSectionStatus(section),
    version: section.version ?? undefined,
    tableCount: apiSection.table_count ?? apiSection.tables?.length ?? 0,
    seatCount:
      apiSection.seat_count ??
      apiSection.tables?.reduce((sum, table) => sum + (table.capacity ?? 0), 0) ??
      0,
    isDefault: apiSection.is_default === true,
  };
}

export function buildCreateFloorInput(form: FloorDraftForm): CreateFloorInput {
  return {
    name: form.name.trim(),
    code: form.code.trim() || null,
    floor_type: asFloorType(form.type),
    description: form.description.trim() || null,
    is_active: form.active,
  };
}

export function buildUpdateFloorInput(form: FloorDraftForm, version: number): UpdateFloorInput {
  const status = form.active ? 'active' : 'inactive';
  return {
    name: form.name.trim(),
    code: form.code.trim() || null,
    description: form.description.trim() || null,
    status,
    version,
  };
}

export function buildCreateSectionInput(input: {
  name: string;
  code: string;
  description: string;
  active: boolean;
}): CreateSectionInput {
  return {
    name: input.name.trim(),
    code: input.code.trim() || null,
    description: input.description.trim() || null,
    is_active: input.active,
  };
}

export function buildUpdateSectionInput(
  input: {
    name: string;
    code: string;
    description: string;
    active: boolean;
  },
  version: number,
): UpdateSectionInput {
  return {
    ...buildCreateSectionInput(input),
    status: input.active ? 'active' : 'inactive',
    version,
  };
}

export function buildArchiveInput(version: number) {
  return { version };
}

export function buildCreateTableInput(
  table: Pick<TableDraft, 'number' | 'capacity' | 'reservations'>,
): CreateTableInput {
  const label = table.number.trim();
  return {
    name: label,
    table_number: label,
    capacity: table.capacity,
    reservations_enabled: table.reservations,
    is_active: true,
  };
}

function asTableShape(value: unknown): TableShape {
  return typeof value === 'string' && TABLE_SHAPES.includes(value as TableShape)
    ? (value as TableShape)
    : 'square';
}

function asTableConfigStatus(table: ApiDiningTable): TableConfigStatus {
  if (table.status === 'active') return 'active';
  if (
    table.status === 'inactive' ||
    table.status === 'archived' ||
    table.status === 'maintenance'
  ) {
    return 'inactive';
  }
  if (table.is_active === false) return 'inactive';
  if (
    typeof table.status === 'string' &&
    TABLE_CONFIG_STATUSES.includes(table.status as TableConfigStatus)
  ) {
    return table.status as TableConfigStatus;
  }
  return 'active';
}

function asTableOperationalStatus(table: ApiDiningTable): FloorTableStatus {
  const value = table.status;
  if (value === 'available' || value === 'reserved' || value === 'occupied') {
    return value;
  }
  return 'available';
}

export function mapApiTableToFloorTable(
  table: ApiDiningTable,
  section: FloorSection,
  index = 0,
): FloorTableItem {
  return {
    id: String(table.id ?? `${section.id}-table-${index + 1}`),
    number:
      table.name ??
      table.table_number ??
      table.number ??
      table.code ??
      `T${String(index + 1).padStart(3, '0')}`,
    capacity: table.capacity ?? table.seats ?? 0,
    status: asTableOperationalStatus(table),
    configStatus: asTableConfigStatus(table),
    version: table.version ?? undefined,
    reservations: table.reservations_enabled ?? false,
    area: section.name,
    shape: asTableShape(table.shape),
    sectionId: String(table.section_id ?? section.id),
  };
}

export function mapFloorMapTables(
  map: ApiFloorMap,
  floorId: string,
): { sections: FloorSection[]; tables: FloorTableItem[] } {
  const apiFloor = map.floors?.find((floor) => String((floor as ApiFloor).id) === floorId) as
    ApiFloor | undefined;
  if (!apiFloor?.sections?.length) {
    return { sections: [], tables: [] };
  }

  const sections = apiFloor.sections.map(mapApiSectionToSection);
  const tables = apiFloor.sections.flatMap((section, sectionIndex) => {
    const uiSection = sections[sectionIndex] ?? mapApiSectionToSection(section, sectionIndex);
    const apiSection = section as ApiSectionWithTables;
    return (apiSection.tables ?? []).map((table, tableIndex) =>
      mapApiTableToFloorTable(table, uiSection, tableIndex),
    );
  });

  return { sections, tables };
}

export function buildBulkCreateTablesInput(
  tables: readonly Pick<TableDraft, 'number' | 'capacity' | 'reservations'>[],
): BulkCreateTablesInput {
  return {
    items: tables.map((table) => {
      const label = table.number.trim();
      return {
        name: label,
        table_number: label,
        capacity: table.capacity,
        reservations_enabled: table.reservations,
        is_active: true,
      };
    }),
  };
}

function buildTableUpdateBody(
  table: Pick<FloorTableItem, 'number' | 'capacity' | 'configStatus'>,
  version: number,
): UpdateTableInput {
  const lifecycle = normalizeLifecycleStatus(table.configStatus);
  return {
    name: table.number.trim(),
    description: '',
    capacity: table.capacity,
    sort_order: 0,
    status: lifecycle,
    version,
  };
}

export function buildBulkUpdateTablesInput(
  tables: readonly FloorTableItem[],
): BulkUpdateTablesInput {
  return {
    items: tables.map((table) => ({
      table_id: table.id,
      ...buildTableUpdateBody(table, table.version ?? 0),
    })),
  };
}

export function buildUpdateTableInputFromEdit(
  value: Pick<FloorTableItem, 'number' | 'capacity' | 'shape' | 'configStatus' | 'reservations'>,
  version: number,
): UpdateTableInput {
  return buildTableUpdateBody(value, version);
}

export function buildMoveTableInput(targetSectionId: string): MoveTableInput {
  return { target_section_id: targetSectionId };
}

export function buildCombineTablesInput(tableIds: readonly string[]): CombineTablesInput {
  return { table_ids: tableIds };
}

export function buildReorderTablesInput(tables: readonly Pick<FloorTableItem, 'id'>[]): {
  items: Array<{ table_id: string; sort_order: number }>;
} {
  return {
    items: tables.map((table, index) => ({
      table_id: table.id,
      sort_order: index,
    })),
  };
}

export function mapApiFloorToFloor(floor: ApiFloor, tables: readonly FloorTableItem[] = []): Floor {
  const tableCount = floor.table_count ?? 0;
  const seatCount = floor.seat_count ?? 0;
  const sections = (floor.sections ?? []).map(mapApiSectionToSection);
  const updatedAt = floor.updated_at ?? floor.created_at ?? '';
  const createdOn = (floor.created_at ?? '').slice(0, 10);
  const statsFromTables =
    tables.length > 0
      ? computeFloorStatsFromTables(tables, sections)
      : {
          totalTables: tableCount,
          totalSeats: seatCount,
          activeTables: tableCount,
          inactiveTables: 0,
        };

  return {
    id: String(floor.id),
    name: floor.name,
    code: floor.code ?? undefined,
    version: floor.version ?? undefined,
    type: asFloorType(floor.floor_type ?? floor.type),
    status: asFloorStatus(floor),
    tableCount,
    seatCount,
    updatedAt,
    branch: floor.branch_name ?? '',
    createdOn,
    createdBy: createdByLabel(floor.created_by),
    description: floor.description ?? '',
    sections,
    stats: statsFromTables,
    activity: updatedAt
      ? [{ id: `${floor.id}-updated`, message: 'Floor updated', occurredAt: updatedAt }]
      : [],
  };
}

const API_TO_FORM_FIELD: Readonly<Record<string, string>> = {
  name: 'name',
  code: 'code',
  floor_type: 'type',
  type: 'type',
  description: 'description',
  is_active: 'active',
};

const LOC_CONTEXT = new Set(['body', 'path', 'query', 'header', 'cookie']);

export function mapFloorFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiRequestError) || !Array.isArray(error.details)) {
    return {};
  }

  const fields: Record<string, string> = {};

  for (const item of error.details) {
    if (!item || typeof item !== 'object' || !('loc' in item) || !Array.isArray(item.loc)) {
      continue;
    }

    const fieldKey = [...item.loc]
      .reverse()
      .find((part) => typeof part === 'string' && !LOC_CONTEXT.has(part));
    if (typeof fieldKey !== 'string') continue;

    const formKey = API_TO_FORM_FIELD[fieldKey] ?? fieldKey;
    const message = typeof item.msg === 'string' ? item.msg : 'Invalid value.';
    if (!fields[formKey]) fields[formKey] = message;
  }

  return fields;
}
