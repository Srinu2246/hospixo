import { ApiError, type HttpMethod, type QueryParams } from '@/services/api/types';

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
  body?: unknown;
};

type FloorRecord = {
  id: number;
  public_id: string;
  organization_id: number;
  company_id: number;
  branch_id: number;
  name: string;
  description: string;
  sort_order: number;
  status: string;
  version: number;
  archived_at: string | null;
  archived_reason: string | null;
  created_at: string;
  updated_at: string;
  code: string;
};

type SectionRecord = FloorRecord & {
  floor_id: number;
  is_default: boolean;
};

type TableRecord = {
  id: number;
  public_id: string;
  organization_id: number;
  company_id: number;
  branch_id: number;
  floor_id: number;
  section_id: number;
  name: string;
  description: string;
  capacity: number;
  sort_order: number;
  status: string;
  version: number;
  archived_at: string | null;
  archived_reason: string | null;
  created_at: string;
  updated_at: string;
};

const ORGANIZATION_ID = 126;
const COMPANY_ID = 94;
const CREATED_AT = '2026-10-08T12:50:06.121Z';

const floors: FloorRecord[] = [
  floor(59, 49, 'Ground Floor', 'GF-1', 8),
  floor(66, 49, 'First Floor', 'FF-01', 3),
];

const sections: SectionRecord[] = [
  section(93, 59, 49, 'Main Dining', 'MD-1', true),
  section(92, 66, 49, 'Right side', 'RS-1', true),
];

const tables: TableRecord[] = [
  table(103, 59, 93, 49, 'T010', 6, 0),
  table(101, 66, 92, 49, 'T001', 4, 0),
  table(102, 66, 92, 49, 'T002', 4, 1),
];

let nextId = 200;

const FLOOR_PATH = /^\/v1\/branches\/(\d+)\/floors(?:\/(.*))?$/;

export function resolveRestaurantFloorMock(request: MockRequest): unknown | undefined {
  const match = FLOOR_PATH.exec(request.path);
  if (!match?.[1]) return undefined;

  const branchId = Number(match[1]);
  const parts = match[2] ? match[2].split('/').filter(Boolean) : [];
  return routeFloor(request, branchId, parts);
}

function routeFloor(request: MockRequest, branchId: number, parts: string[]): unknown {
  if (parts.length === 0) {
    if (request.method === 'POST') return ok(createFloor(branchId, request.body), 'Floor created');
    // Nested sections match POS api.md §1.1; floor-setup parsers strip unknown fields.
    return paged(listFloorsWithSections(branchId, request.params), 'Floors retrieved');
  }

  const floorId = numberId(parts[0]);
  const current = findFloor(branchId, floorId);
  if (!current) return undefined;

  if (parts.length === 1) {
    if (request.method === 'PATCH') return ok(updateFloor(current, request.body), 'Floor updated');
    return ok(current, 'Floor retrieved');
  }

  if (parts[1] === 'archive' && request.method === 'POST') {
    return ok(archiveRecord(current, request.body), 'Floor archived');
  }
  if (parts[1] === 'restore' && request.method === 'POST') {
    return ok(restoreRecord(current, request.body), 'Floor restored');
  }
  if (parts[1] !== 'sections') return undefined;

  if (parts.length === 2) {
    if (request.method === 'POST') {
      return ok(createSection(current, request.body), 'Section created');
    }
    return paged(
      sections.filter((item) => item.branch_id === branchId && item.floor_id === floorId),
      'Sections retrieved',
    );
  }

  const sectionId = numberId(parts[2]);
  const currentSection = sections.find(
    (item) => item.id === sectionId && item.branch_id === branchId && item.floor_id === floorId,
  );
  if (!currentSection) return undefined;

  if (parts.length === 3) {
    if (request.method === 'PATCH') {
      return ok(updateSection(currentSection, request.body), 'Section updated');
    }
    return ok(currentSection, 'Section retrieved');
  }

  if (parts[3] === 'archive' && request.method === 'POST') {
    return ok(archiveRecord(currentSection, request.body), 'Section archived');
  }
  if (parts[3] === 'restore' && request.method === 'POST') {
    return ok(restoreRecord(currentSection, request.body), 'Section restored');
  }
  if (parts[3] === 'floor-map' && request.method === 'GET') {
    return ok(floorMap(branchId), 'Floor map retrieved');
  }
  if (parts[3] !== 'tables') return undefined;

  return routeTables(request, current, currentSection, parts.slice(4));
}

function routeTables(
  request: MockRequest,
  currentFloor: FloorRecord,
  currentSection: SectionRecord,
  parts: string[],
): unknown {
  const owned = () =>
    tables.filter(
      (item) =>
        item.branch_id === currentFloor.branch_id &&
        item.floor_id === currentFloor.id &&
        item.section_id === currentSection.id,
    );

  if (parts.length === 0) {
    if (request.method === 'POST') {
      return ok(createTable(currentFloor, currentSection, request.body), 'Table created');
    }
    return paged(owned(), 'Tables retrieved');
  }

  if (parts[0] === 'bulk') {
    if (request.method === 'POST') {
      return ok(createTables(currentFloor, currentSection, request.body), 'Tables created');
    }
    if (request.method === 'PATCH') {
      return ok(updateTables(currentFloor, currentSection, request.body), 'Tables updated');
    }
    return undefined;
  }

  const tableId = numberId(parts[0]);
  const currentTable = tables.find(
    (item) => item.id === tableId && item.section_id === currentSection.id,
  );
  if (!currentTable) return undefined;

  if (parts.length === 1) {
    if (request.method === 'PATCH')
      return ok(updateTable(currentTable, request.body), 'Table updated');
    return ok(currentTable, 'Table retrieved');
  }

  if (parts[1] === 'move' && request.method === 'POST') {
    return ok(moveTable(currentTable, request.body), 'Table moved');
  }
  if (parts[1] === 'archive' && request.method === 'POST') {
    return ok(archiveRecord(currentTable, request.body), 'Table archived');
  }
  if (parts[1] === 'restore' && request.method === 'POST') {
    return ok(restoreRecord(currentTable, request.body), 'Table restored');
  }
  return undefined;
}

function listFloors(branchId: number, params: QueryParams | undefined): FloorRecord[] {
  const status = typeof params?.status === 'string' ? params.status : '';
  return floors.filter((item) => {
    if (item.branch_id !== branchId) return false;
    if (!status || status === 'all') return true;
    return item.status === status;
  });
}

type FloorListItem = FloorRecord & {
  floor_type: string;
  is_active: boolean;
  table_count: number;
  sections: Array<{
    id: number;
    name: string;
    code: string;
    is_active: boolean;
    table_count: number;
  }>;
};

/** POS table floor plan needs floors with nested sections in one response. */
function listFloorsWithSections(
  branchId: number,
  params: QueryParams | undefined,
): FloorListItem[] {
  return listFloors(branchId, params).map((item) => {
    const floorSections = sections.filter(
      (section) => section.branch_id === branchId && section.floor_id === item.id,
    );
    const floorTables = tables.filter(
      (table) => table.branch_id === branchId && table.floor_id === item.id,
    );

    return {
      ...item,
      floor_type: 'indoor',
      is_active: item.status === 'active',
      table_count: floorTables.length,
      sections: floorSections.map((section) => ({
        id: section.id,
        name: section.name,
        code: section.code,
        is_active: section.status === 'active',
        table_count: floorTables.filter((table) => table.section_id === section.id).length,
      })),
    };
  });
}

function createFloor(branchId: number, body: unknown): FloorRecord {
  const created = floor(
    nextId++,
    branchId,
    readString(body, 'name', 'New Floor'),
    readString(body, 'code'),
    1,
  );
  created.description = readString(body, 'description');
  created.sort_order = readNumber(body, 'sort_order', 0);
  floors.unshift(created);
  return created;
}

function updateFloor(current: FloorRecord, body: unknown): FloorRecord {
  current.name = readString(body, 'name', current.name);
  current.description = readString(body, 'description', current.description);
  current.code = readString(body, 'code', current.code);
  current.sort_order = readNumber(body, 'sort_order', current.sort_order);
  current.status = readString(body, 'status', current.status);
  current.version += 1;
  current.updated_at = stamp();
  return current;
}

function createSection(currentFloor: FloorRecord, body: unknown): SectionRecord {
  const created = section(
    nextId++,
    currentFloor.id,
    currentFloor.branch_id,
    readString(body, 'name', 'New Section'),
    readString(body, 'code'),
    false,
  );
  created.description = readString(body, 'description');
  created.sort_order = readNumber(body, 'sort_order', 0);
  sections.push(created);
  return created;
}

function updateSection(current: SectionRecord, body: unknown): SectionRecord {
  updateFloor(current, body);
  return current;
}

function createTable(
  currentFloor: FloorRecord,
  currentSection: SectionRecord,
  body: unknown,
): TableRecord {
  const name = readString(body, 'name', 'T001');
  assertUniqueTableName(currentFloor.branch_id, name);
  const created = table(
    nextId++,
    currentFloor.id,
    currentSection.id,
    currentFloor.branch_id,
    name,
    readNumber(body, 'capacity', 1),
    readNumber(body, 'sort_order', 0),
  );
  created.description = readString(body, 'description');
  tables.push(created);
  return created;
}

function createTables(
  currentFloor: FloorRecord,
  currentSection: SectionRecord,
  body: unknown,
): TableRecord[] {
  const items = readItems(body);
  return items.map((item) => createTable(currentFloor, currentSection, item));
}

function updateTable(current: TableRecord, body: unknown): TableRecord {
  const name = readString(body, 'name', current.name);
  if (name.toLowerCase() !== current.name.toLowerCase()) {
    assertUniqueTableName(current.branch_id, name);
  }
  current.name = name;
  current.description = readString(body, 'description', current.description);
  current.capacity = readNumber(body, 'capacity', current.capacity);
  current.sort_order = readNumber(body, 'sort_order', current.sort_order);
  current.status = readString(body, 'status', current.status);
  current.version += 1;
  current.updated_at = stamp();
  return current;
}

function updateTables(
  currentFloor: FloorRecord,
  currentSection: SectionRecord,
  body: unknown,
): TableRecord[] {
  return readItems(body).map((item) => {
    const tableId = readNumber(item, 'table_id', 0);
    const current = tables.find(
      (entry) =>
        entry.id === tableId &&
        entry.floor_id === currentFloor.id &&
        entry.section_id === currentSection.id,
    );
    if (!current) throw new ApiError('Table not found', 404);
    return updateTable(current, item);
  });
}

function moveTable(current: TableRecord, body: unknown): TableRecord {
  const floorId = readNumber(body, 'floor_id', current.floor_id);
  const sectionId = readNumber(body, 'section_id', current.section_id);
  const destination = sections.find((item) => item.id === sectionId && item.floor_id === floorId);
  if (!destination) throw new ApiError('Section not found', 404);
  current.floor_id = floorId;
  current.section_id = sectionId;
  current.branch_id = destination.branch_id;
  current.version += 1;
  current.updated_at = stamp();
  return current;
}

function floorMap(branchId: number) {
  return {
    branch_id: branchId,
    floors: floors
      .filter((item) => item.branch_id === branchId)
      .map((item) => ({
        id: item.id,
        public_id: item.public_id,
        name: item.name,
        code: item.code,
        sort_order: item.sort_order,
        status: item.status,
        sections: sections
          .filter((entry) => entry.floor_id === item.id)
          .map((entry) => ({
            id: entry.id,
            public_id: entry.public_id,
            name: entry.name,
            code: entry.code,
            sort_order: entry.sort_order,
            status: entry.status,
            is_default: entry.is_default,
            tables: tables
              .filter((tableItem) => tableItem.section_id === entry.id)
              .map((tableItem) => ({
                id: tableItem.id,
                public_id: tableItem.public_id,
                name: tableItem.name,
                capacity: tableItem.capacity,
                sort_order: tableItem.sort_order,
                status: tableItem.status,
              })),
          })),
      })),
  };
}

function archiveRecord<
  T extends {
    status: string;
    version: number;
    archived_at: string | null;
    archived_reason: string | null;
    updated_at: string;
  },
>(current: T, body: unknown): T {
  current.status = 'inactive';
  current.archived_at = stamp();
  current.archived_reason = readString(body, 'reason', 'Archived');
  current.version += 1;
  current.updated_at = current.archived_at;
  return current;
}

function restoreRecord<
  T extends {
    status: string;
    version: number;
    archived_at: string | null;
    archived_reason: string | null;
    updated_at: string;
  },
>(current: T, _body: unknown): T {
  current.status = 'active';
  current.archived_at = null;
  current.archived_reason = null;
  current.version += 1;
  current.updated_at = stamp();
  return current;
}

function assertUniqueTableName(branchId: number, name: string): void {
  const taken = tables.some(
    (item) => item.branch_id === branchId && item.name.toLowerCase() === name.trim().toLowerCase(),
  );
  if (taken) {
    throw new ApiError('That table number is already used in this branch.', 409);
  }
}

function findFloor(branchId: number, floorId: number): FloorRecord | undefined {
  return floors.find((item) => item.id === floorId && item.branch_id === branchId);
}

function floor(
  id: number,
  branchId: number,
  name: string,
  code: string,
  version: number,
): FloorRecord {
  return {
    id,
    public_id: publicId(id),
    organization_id: ORGANIZATION_ID,
    company_id: COMPANY_ID,
    branch_id: branchId,
    name,
    description: '',
    sort_order: 0,
    status: 'active',
    version,
    archived_at: null,
    archived_reason: null,
    created_at: CREATED_AT,
    updated_at: CREATED_AT,
    code,
  };
}

function section(
  id: number,
  floorId: number,
  branchId: number,
  name: string,
  code: string,
  isDefault: boolean,
): SectionRecord {
  return { ...floor(id, branchId, name, code, 1), floor_id: floorId, is_default: isDefault };
}

function table(
  id: number,
  floorId: number,
  sectionId: number,
  branchId: number,
  name: string,
  capacity: number,
  sortOrder: number,
): TableRecord {
  return {
    id,
    public_id: publicId(id),
    organization_id: ORGANIZATION_ID,
    company_id: COMPANY_ID,
    branch_id: branchId,
    floor_id: floorId,
    section_id: sectionId,
    name,
    description: '',
    capacity,
    sort_order: sortOrder,
    status: 'active',
    version: 1,
    archived_at: null,
    archived_reason: null,
    created_at: CREATED_AT,
    updated_at: CREATED_AT,
  };
}

function ok<T>(
  data: T,
  message: string,
): {
  success: true;
  data: T;
  message: string;
  request_id: string;
} {
  return { success: true, data, message, request_id: 'mock' };
}

function paged<T>(items: T[], message: string) {
  return ok({ items, total: items.length, page: 1, page_size: 50 }, message);
}

function readString(body: unknown, key: string, fallback = ''): string {
  if (!isRecord(body)) return fallback;
  const value = body[key];
  return typeof value === 'string' ? value : fallback;
}

function readNumber(body: unknown, key: string, fallback: number): number {
  if (!isRecord(body)) return fallback;
  const value = body[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readItems(body: unknown): unknown[] {
  if (!isRecord(body) || !Array.isArray(body.items)) return [];
  return body.items;
}

function numberId(value: string | undefined): number {
  return value && /^\d+$/.test(value) ? Number(value) : 0;
}

function publicId(id: number): string {
  return `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`;
}

function stamp(): string {
  return new Date().toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
