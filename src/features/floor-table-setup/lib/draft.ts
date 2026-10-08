import type {
  Floor,
  FloorSetupDraft,
  FloorTableItem,
  FloorType,
  SectionDraft,
  TableDraft,
} from '@/features/floor-table-setup/types/floor-table-setup';

const DEFAULT_FLOOR_TYPE: FloorType = 'indoor';

export function createEmptyDraft(): FloorSetupDraft {
  return {
    floor: {
      name: '',
      code: '',
      type: DEFAULT_FLOOR_TYPE,
      description: '',
      active: true,
    },
    sections: [],
    tables: [],
  };
}

export type ParsedTableNumber = Readonly<{
  prefix: string;
  number: number;
  width: number;
}>;

export function parseTableNumber(value: string): ParsedTableNumber | null {
  const match = value.trim().match(/^(.*?)(\d+)$/);
  if (!match?.[2]) return null;
  return {
    prefix: match[1] || '',
    number: Number(match[2]),
    width: match[2].length,
  };
}

function parseTrailingNumber(value: string): ParsedTableNumber | null {
  return parseTableNumber(value);
}

export function nextEntityCode(prefix: string, existing: readonly { code: string }[]) {
  const normalizedPrefix = prefix.trim();
  let max = 0;

  for (const item of existing) {
    const code = item.code.trim();
    if (!code) continue;

    const parsed = parseTrailingNumber(code);
    if (!parsed) continue;

    const codePrefix = parsed.prefix.replace(/-+$/, '');
    if (codePrefix.toLowerCase() !== normalizedPrefix.toLowerCase()) continue;

    max = Math.max(max, parsed.number);
  }

  const next = max + 1;
  return `${normalizedPrefix}-${String(next).padStart(3, '0')}`;
}

/** @alias nextTableNumber */
export function getNextTableNumber(existing: readonly { number: string }[]) {
  return nextTableNumber(existing);
}

export function nextTableNumber(existing: readonly { number: string }[]) {
  if (existing.length === 0) return 'T001';

  let max = 0;
  let prefix = 'T';
  let width = 3;

  for (const item of existing) {
    const parsed = parseTrailingNumber(item.number);
    if (!parsed) continue;
    if (parsed.number > max) {
      max = parsed.number;
      prefix = parsed.prefix || 'T';
      width = parsed.width;
    }
  }

  if (max === 0) {
    return `${prefix}${String(existing.length + 1).padStart(width, '0')}`;
  }

  return `${prefix}${String(max + 1).padStart(width, '0')}`;
}

export function createSectionDraft(
  input: Readonly<{ name: string; code: string; description: string; active: boolean }>,
): SectionDraft {
  return {
    id: `section-${crypto.randomUUID()}`,
    name: input.name.trim(),
    code: input.code.trim(),
    description: input.description.trim(),
    active: input.active,
    tableCount: 0,
    seatCount: 0,
  };
}

export function generateTableNumbers(startNumber: string, quantity: number): string[] {
  const normalized = startNumber.trim();
  const parsed = parseTableNumber(normalized);
  const prefix = parsed?.prefix ?? 'T';
  const start = parsed?.number ?? 1;
  const width = parsed?.width ?? 3;

  return Array.from({ length: Math.max(0, quantity) }, (_, index) => {
    const value = start + index;
    return `${prefix}${String(value).padStart(width, '0')}`;
  });
}

export type TableNumberRangeValidation =
  Readonly<{ ok: true }> | Readonly<{ ok: false; message: string; conflicts: readonly string[] }>;

function normalizeTableNumberKey(value: string) {
  return value.trim().toUpperCase();
}

export function validateTableNumberRange(
  existing: readonly { number: string }[],
  startNumber: string,
  quantity: number,
): TableNumberRangeValidation {
  const trimmedStart = startNumber.trim();
  if (!trimmedStart) {
    return { ok: false, message: 'Starting table number is required.', conflicts: [] };
  }

  if (!parseTableNumber(trimmedStart)) {
    return {
      ok: false,
      message: 'Starting table number must end with digits (e.g. T5 or T001).',
      conflicts: [],
    };
  }

  if (!Number.isFinite(quantity) || quantity < 1) {
    return { ok: false, message: 'Number of tables must be at least 1.', conflicts: [] };
  }

  const generated = generateTableNumbers(trimmedStart, quantity);
  const existingSet = new Set(existing.map((table) => normalizeTableNumberKey(table.number)));
  const conflicts = generated.filter((number) => existingSet.has(normalizeTableNumberKey(number)));

  if (conflicts.length === 0) {
    return { ok: true };
  }

  const uniqueConflicts = [...new Set(conflicts)];
  const rangeLabel =
    uniqueConflicts.length === 1
      ? uniqueConflicts[0]
      : `${uniqueConflicts[0]}–${uniqueConflicts[uniqueConflicts.length - 1]}`;

  return {
    ok: false,
    message: `Table numbers ${rangeLabel} already exist. Please choose another starting number.`,
    conflicts: uniqueConflicts,
  };
}

export function generateTables(
  input: Readonly<{
    startNumber: string;
    count: number;
    capacity: number;
    reservations: boolean;
    existing: readonly { number: string }[];
  }>,
): TableDraft[] {
  const normalizedStart = input.startNumber.trim() || nextTableNumber(input.existing);
  const numbers = generateTableNumbers(normalizedStart, input.count);

  return numbers.map((number) => ({
    id: `table-${crypto.randomUUID()}`,
    number,
    capacity: input.capacity,
    status: 'available' as const,
    reservations: input.reservations,
  }));
}

export function syncSectionStats(
  sections: readonly SectionDraft[],
  tables: readonly TableDraft[],
): SectionDraft[] {
  if (sections.length === 0) return [...sections];

  return sections.map((section) => {
    const sectionTables = tables.filter((table) => {
      if (table.sectionId === section.id) return true;
      if (sections.length === 1 && !table.sectionId) return true;
      return false;
    });
    return {
      ...section,
      tableCount: sectionTables.length,
      seatCount: sectionTables.reduce((sum, table) => sum + table.capacity, 0),
    };
  });
}

export function enrichSetupDraftWithSectionStats(draft: FloorSetupDraft): FloorSetupDraft {
  return {
    ...draft,
    sections: syncSectionStats(draft.sections, draft.tables),
  };
}

export function mergeSetupDraftFromServer(
  current: FloorSetupDraft,
  fromServer: FloorSetupDraft,
): FloorSetupDraft {
  const tables =
    fromServer.tables.length > 0
      ? fromServer.tables
      : current.tables.length > fromServer.tables.length
        ? current.tables
        : fromServer.tables;

  return enrichSetupDraftWithSectionStats({
    ...fromServer,
    tables,
  });
}

export const NEW_TABLE_SECTION_ID = '__new__';

export type NewTableSectionInput = Readonly<{
  name: string;
  code: string;
}>;

export type TableSectionChoice =
  | Readonly<{ kind: 'existing'; sectionId: string }>
  | Readonly<{ kind: 'new'; section: NewTableSectionInput }>
  | Readonly<{ kind: 'missing' }>;

export function parseTableSectionChoice(input: {
  sectionId?: string;
  newSection?: NewTableSectionInput;
}): TableSectionChoice {
  const name = input.newSection?.name.trim() ?? '';
  if (name) {
    return {
      kind: 'new',
      section: {
        name,
        code: input.newSection?.code.trim() ?? '',
      },
    };
  }

  const sectionId = input.sectionId?.trim() ?? '';
  if (sectionId && sectionId !== NEW_TABLE_SECTION_ID) {
    return { kind: 'existing', sectionId };
  }

  return { kind: 'missing' };
}

export function filterByQuery<T>(
  items: readonly T[],
  query: string,
  getText: (item: T) => string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...items];
  return items.filter((item) => getText(item).toLowerCase().includes(normalized));
}

export function commitDraftToFloor(draft: FloorSetupDraft, branchLabel = ''): Floor {
  const now = new Date().toISOString();
  const id = `floor-${crypto.randomUUID()}`;
  const tables: FloorTableItem[] = draft.tables.map((table) => ({
    ...table,
    configStatus: 'active' as const,
    area: draft.sections[0]?.name ?? draft.floor.name,
    shape: 'square' as const,
  }));
  const sections = syncSectionStats(draft.sections, draft.tables).map((section) => ({
    id: section.id,
    name: section.name,
    code: section.code,
    description: section.description,
    status: section.active ? ('active' as const) : ('inactive' as const),
    tableCount: section.tableCount,
    seatCount: section.seatCount,
  }));
  const seatCount = tables.reduce((sum, table) => sum + table.capacity, 0);

  return {
    id,
    name: draft.floor.name.trim(),
    code: draft.floor.code.trim(),
    type: draft.floor.type || null,
    status: draft.floor.active ? 'active' : 'draft',
    tableCount: tables.length,
    seatCount,
    updatedAt: now,
    branch: branchLabel,
    createdOn: now.slice(0, 10),
    createdBy: 'Admin',
    description: draft.floor.description.trim(),
    sections,
    tables,
    stats: {
      totalTables: tables.length,
      totalSeats: seatCount,
      activeTables: tables.filter((table) => table.status === 'available').length,
      inactiveTables: 0,
    },
    activity: [
      {
        id: `${id}-created`,
        message: 'Floor published',
        occurredAt: now,
      },
    ],
  };
}

export function seatingSummary(tables: readonly TableDraft[]) {
  const seats = tables.reduce((sum, table) => sum + table.capacity, 0);
  return { tables: tables.length, seats };
}

export function isFloorType(value: string): value is FloorType {
  return value === 'indoor' || value === 'outdoor' || value === 'vip' || value === 'banquet';
}

export function isInternalItemsError(message: string) {
  return /^\s*items\s*:/i.test(message);
}
