import { getMockOrderSettleDetail, MOCK_POS_ORDERS } from '@/lib/mocks/pos/usePosOrders.mocks';
import { addBranchOrderItemsBodySchema } from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderItemsSchema';
import type { PosOrderListItem } from '@/lib/schemas/pos/point-of-sale/all-orders/posOrdersSchema';
import { createBranchOrderBodySchema } from '@/lib/schemas/pos/point-of-sale/tables/createBranchOrderSchema';
import type { TableAvailabilityRow } from '@/lib/schemas/pos/point-of-sale/tables/tableAvailabilitySchema';
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

/** Single sections source for floors list, sections API, and floor-map. */
const sections: SectionRecord[] = [
  section(93, 59, 49, 'Main Dining', 'MD-1', true),
  section(92, 66, 49, 'Right side', 'RS-1', true),
];

const tables: TableRecord[] = [
  table(103, 59, 93, 49, 'T1', 4, 0),
  table(104, 59, 93, 49, 'T2', 4, 1),
  table(105, 59, 93, 49, 'T3', 2, 2),
  table(106, 59, 93, 49, 'T4', 4, 3),
  table(107, 59, 93, 49, 'T5', 2, 4),
  table(108, 59, 93, 49, 'T6', 2, 5),
  table(109, 59, 93, 49, 'T7', 4, 6),
  table(110, 59, 93, 49, 'T8', 6, 7),
  table(101, 66, 92, 49, 'T9', 4, 0),
  table(102, 66, 92, 49, 'T10', 4, 1),
  table(111, 66, 92, 49, 'T11', 4, 2),
  table(112, 66, 92, 49, 'T12', 2, 3),
];

/**
 * Open orders for GET /v1/branches/{branch_id}/orders.
 * Seeded from All Orders mock rows (same contract as the live API).
 */
const MOCK_OPEN_ORDERS: PosOrderListItem[] = [...MOCK_POS_ORDERS];
let nextId = 200;

const FLOOR_PATH = /^\/v1\/branches\/(\d+)\/floors(?:\/(.*))?$/;
const BRANCH_ORDERS_PATH = /^\/v1\/branches\/(\d+)\/orders$/;
const BRANCH_ORDER_DETAIL_PATH = /^\/v1\/branches\/(\d+)\/orders\/(\d+)$/;
const BRANCH_ORDER_ITEMS_PATH = /^\/v1\/branches\/(\d+)\/orders\/(\d+)\/items$/;
const BRANCH_ORDER_ITEM_PATH = /^\/v1\/branches\/(\d+)\/orders\/(\d+)\/items\/(\d+)$/;
const BRANCH_ORDER_SUBMIT_PATH = /^\/v1\/branches\/(\d+)\/orders\/(\d+)\/submit$/;
const BRANCH_MEAL_SESSIONS_PATH = /^\/v1\/branches\/(\d+)\/meal-sessions(?:\/(\d+))?$/;
const BRANCH_TABLES_AVAILABILITY_PATH = /^\/v1\/branches\/(\d+)\/tables\/availability$/;

export function resolveRestaurantFloorMock(request: MockRequest): unknown | undefined {
  const mealSessionsMatch = BRANCH_MEAL_SESSIONS_PATH.exec(request.path);
  if (mealSessionsMatch?.[1]) {
    const branchId = Number(mealSessionsMatch[1]);
    const sessionIdSegment = mealSessionsMatch[2];
    if (!sessionIdSegment) {
      if (request.method === 'GET') {
        return mealSessionsList(branchId, request.params);
      }
      if (request.method === 'POST') {
        return createMealSession(branchId, request.body);
      }
    } else if (request.method === 'PATCH') {
      return updateMealSession(branchId, Number(sessionIdSegment), request.body);
    }
  }

  const availabilityMatch = BRANCH_TABLES_AVAILABILITY_PATH.exec(request.path);
  if (availabilityMatch?.[1] && request.method === 'GET') {
    return tablesAvailabilityList(Number(availabilityMatch[1]), request.params);
  }

  const orderItemsMatch = BRANCH_ORDER_ITEMS_PATH.exec(request.path);
  if (orderItemsMatch?.[1] && orderItemsMatch[2] && request.method === 'POST') {
    return addBranchOrderItems(
      Number(orderItemsMatch[1]),
      Number(orderItemsMatch[2]),
      request.body,
    );
  }

  const orderItemMatch = BRANCH_ORDER_ITEM_PATH.exec(request.path);
  if (
    orderItemMatch?.[1] &&
    orderItemMatch[2] &&
    orderItemMatch[3] &&
    request.method === 'DELETE'
  ) {
    return removeBranchOrderItem(
      Number(orderItemMatch[1]),
      Number(orderItemMatch[2]),
      Number(orderItemMatch[3]),
      request.params,
    );
  }

  const orderSubmitMatch = BRANCH_ORDER_SUBMIT_PATH.exec(request.path);
  if (orderSubmitMatch?.[1] && orderSubmitMatch[2] && request.method === 'POST') {
    return submitBranchOrder(
      Number(orderSubmitMatch[1]),
      Number(orderSubmitMatch[2]),
      request.body,
    );
  }

  const orderDetailMatch = BRANCH_ORDER_DETAIL_PATH.exec(request.path);
  if (orderDetailMatch?.[1] && orderDetailMatch[2] && request.method === 'GET') {
    return openOrderDetail(Number(orderDetailMatch[1]), Number(orderDetailMatch[2]));
  }

  const ordersMatch = BRANCH_ORDERS_PATH.exec(request.path);
  if (ordersMatch?.[1]) {
    const branchId = Number(ordersMatch[1]);
    if (request.method === 'GET') {
      return openOrdersList(branchId, request.params);
    }
    if (request.method === 'POST') {
      return createBranchOrder(branchId, request.body);
    }
  }

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
    return ok(restoreRecord(current), 'Floor restored');
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
    return ok(restoreRecord(currentSection), 'Section restored');
  }
  if (parts[3] === 'floor-map' && request.method === 'GET') {
    return ok(floorMap(branchId, floorId, sectionId), 'Floor map retrieved');
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
    return ok(restoreRecord(currentTable), 'Table restored');
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

/** Floor-setup floor-map (catalog only). POS live status comes from open orders. */
function floorMap(branchId: number, floorId?: number, sectionId?: number) {
  return {
    branch_id: branchId,
    floors: floors
      .filter((item) => item.branch_id === branchId && (floorId == null || item.id === floorId))
      .map((item) => ({
        id: item.id,
        public_id: item.public_id,
        name: item.name,
        code: item.code,
        sort_order: item.sort_order,
        status: item.status,
        sections: sections
          .filter(
            (entry) => entry.floor_id === item.id && (sectionId == null || entry.id === sectionId),
          )
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

/** GET /v1/branches/{branch_id}/tables/availability */
function tablesAvailabilityList(branchId: number, params?: QueryParams) {
  const floorId = queryNumber(params, 'floor_id');
  const sectionId = queryNumber(params, 'section_id');
  const page = queryNumber(params, 'page') ?? 1;
  const pageSize = queryNumber(params, 'page_size') ?? 50;
  const items = buildAvailabilityRows(branchId, floorId, sectionId);

  return {
    success: true,
    data: {
      items,
      total: items.length,
      page,
      page_size: pageSize,
    },
    message: 'Table availability retrieved',
    request_id: 'mock-tables-availability',
  };
}

function buildAvailabilityRows(
  branchId: number,
  floorId?: number,
  sectionId?: number,
): TableAvailabilityRow[] {
  const ordersByTable = new Map(
    MOCK_OPEN_ORDERS.filter((order) => order.table_id != null).map((order) => [
      order.table_id as number,
      order,
    ]),
  );
  const floorNameById = new Map(floors.map((floor) => [floor.id, floor.name]));
  const sectionNameById = new Map(sections.map((section) => [section.id, section.name]));

  return tables
    .filter((table) => {
      if (table.branch_id !== branchId) return false;
      if (table.status.toLowerCase() === 'inactive' || table.archived_at) return false;
      if (floorId != null && table.floor_id !== floorId) return false;
      if (sectionId != null && table.section_id !== sectionId) return false;
      return true;
    })
    .map((table) => {
      const order = ordersByTable.get(table.id);
      const occupied = Boolean(order);
      return {
        id: table.id,
        name: table.name,
        floor_id: table.floor_id,
        floor_name: floorNameById.get(table.floor_id) ?? null,
        section_id: table.section_id,
        section_name: sectionNameById.get(table.section_id) ?? null,
        status: 'active',
        occupancy_status: occupied
          ? order?.status === 'billing'
            ? 'billing'
            : 'occupied'
          : 'available',
        active_order_id: order?.id ?? null,
        available_for_order: !occupied,
        capacity: table.capacity,
      };
    });
}

const mealSessionsStore = new Map<number, Array<Record<string, unknown>>>();

function defaultMealSessions(branchId: number) {
  const now = new Date().toISOString();
  return [
    {
      id: 2,
      public_id: 'df4f2b62-dbf6-4cf7-a983-e43160066d85',
      branch_id: branchId,
      name: 'breakfast',
      start_time: '08:01:52.581000',
      end_time: '23:01:52.581000',
      display_order: 0,
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      public_id: 'df4f2b62-dbf6-4cf7-a983-e43160066d86',
      branch_id: branchId,
      name: 'lunch',
      start_time: '12:00:00.000000',
      end_time: '16:00:00.000000',
      display_order: 1,
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 4,
      public_id: 'df4f2b62-dbf6-4cf7-a983-e43160066d87',
      branch_id: branchId,
      name: 'dinner',
      start_time: '18:00:00.000000',
      end_time: '23:00:00.000000',
      display_order: 2,
      is_active: true,
      created_at: now,
      updated_at: now,
    },
  ];
}

function branchMealSessionsRows(branchId: number) {
  if (!mealSessionsStore.has(branchId)) {
    mealSessionsStore.set(branchId, defaultMealSessions(branchId));
  }
  return mealSessionsStore.get(branchId) ?? [];
}

/** GET /v1/branches/{branch_id}/meal-sessions */
function mealSessionsList(branchId: number, params?: QueryParams) {
  const search = typeof params?.search === 'string' ? params.search.trim().toLowerCase() : '';
  const status = typeof params?.status === 'string' ? params.status.toLowerCase() : '';
  const isActiveParam = params?.is_active;
  const filtered = branchMealSessionsRows(branchId).filter((row) => {
    if (status === 'active' || isActiveParam === true || isActiveParam === 'true') {
      if (row.is_active === false) return false;
    }
    if (status === 'inactive' || isActiveParam === false || isActiveParam === 'false') {
      if (row.is_active !== false) return false;
    }
    if (!search) return true;
    const haystack = [row.name, row.start_time, row.end_time]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(search);
  });

  const page = Number(params?.page ?? 1) || 1;
  const pageSize = Number(params?.page_size ?? 15) || 15;
  const start = (page - 1) * pageSize;

  return {
    success: true,
    data: {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      page_size: pageSize,
    },
    message: 'Meal sessions retrieved',
    request_id: 'mock-meal-sessions',
  };
}

/** PATCH /v1/branches/{branch_id}/meal-sessions/{session_id} */
function updateMealSession(branchId: number, sessionId: number, body: unknown) {
  const record = isRecord(body) ? body : {};
  const rows = branchMealSessionsRows(branchId);
  const index = rows.findIndex((row) => Number(row.id) === sessionId);
  const existing = index >= 0 ? rows[index] : null;
  const now = new Date().toISOString();
  const updated = {
    ...(existing ?? {
      id: sessionId,
      public_id: `mock-meal-session-${sessionId}`,
      branch_id: branchId,
      display_order: rows.length,
      created_at: now,
    }),
    id: sessionId,
    branch_id: branchId,
    name: typeof record.name === 'string' ? record.name : String(existing?.name ?? 'Session'),
    start_time:
      typeof record.start_time === 'string'
        ? record.start_time
        : String(existing?.start_time ?? now),
    end_time:
      typeof record.end_time === 'string' ? record.end_time : String(existing?.end_time ?? now),
    is_active: record.is_active !== false,
    updated_at: now,
  };
  if (index >= 0) {
    rows[index] = updated;
  } else {
    rows.push(updated);
  }
  return {
    success: true,
    data: updated,
    message: 'Meal session updated',
    request_id: 'mock-meal-session-update',
  };
}

/** POST /v1/branches/{branch_id}/meal-sessions */
function createMealSession(branchId: number, body: unknown) {
  const record = isRecord(body) ? body : {};
  const now = new Date().toISOString();
  nextId += 1;
  const created = {
    id: nextId,
    public_id: `mock-meal-session-${nextId}`,
    branch_id: branchId,
    name: typeof record.name === 'string' ? record.name : 'Session',
    start_time: typeof record.start_time === 'string' ? record.start_time : now,
    end_time: typeof record.end_time === 'string' ? record.end_time : now,
    display_order: branchMealSessionsRows(branchId).length,
    is_active: record.is_active !== false,
    created_at: now,
    updated_at: now,
  };
  branchMealSessionsRows(branchId).push(created);
  return {
    success: true,
    data: created,
    message: 'Meal session created',
    request_id: 'mock-meal-session-create',
  };
}

/** POST /v1/branches/{branch_id}/orders — create dine-in order and keep it in the open list. */
function createBranchOrder(branchId: number, body: unknown) {
  const parsed = createBranchOrderBodySchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError('Invalid create order body', 400);
  }
  const {
    table_id: tableId,
    guest_count: guestCount,
    meal_session_id: mealSessionId,
  } = parsed.data;
  const table = tables.find((row) => row.id === tableId && row.branch_id === branchId);
  const now = new Date().toISOString();
  const orderId = 600 + MOCK_OPEN_ORDERS.length;
  const order = {
    id: orderId,
    public_id: `mock-order-${orderId}`,
    order_number: `ORD-${tableId}`,
    order_type: 'dine_in' as const,
    branch_id: branchId,
    table_id: tableId,
    table_name: table?.name ?? `Table ${tableId}`,
    floor_id: table?.floor_id ?? 0,
    section_id: table?.section_id ?? 0,
    guest_count: guestCount,
    business_date: now.slice(0, 10),
    meal_session_id: mealSessionId,
    currency: 'INR',
    status: 'draft' as const,
    payment_status: 'pending' as const,
    opened_at: now,
    created_by_user_id: 1,
    version: 1,
    subtotal: 0,
    discount_total: 0,
    tax_total: 0,
    cgst_total: 0,
    sgst_total: 0,
    igst_total: 0,
    calculated_total: 0,
    round_off: 0,
    grand_total: 0,
    amount_paid: 0,
    tip_total: 0,
    balance_due: 0,
    invoice_number: null,
    closed_at: null,
    items: [],
    payments: [],
    cancellation_reason: null,
    kitchen_badge: 'ordering' as const,
  };

  MOCK_OPEN_ORDERS.push({
    id: order.id,
    public_id: order.public_id,
    order_number: order.order_number,
    order_type: order.order_type,
    table_id: order.table_id,
    table_name: order.table_name,
    floor_id: order.floor_id,
    section_id: order.section_id,
    guest_count: order.guest_count,
    status: order.status,
    kitchen_badge: order.kitchen_badge,
    payment_status: order.payment_status,
    grand_total: order.grand_total,
    opened_at: order.opened_at,
  });

  return {
    success: true,
    data: order,
    message: 'OK',
    request_id: 'mock-create-branch-order',
  };
}

/** POST /v1/branches/{branch_id}/orders/{order_id}/items */
function addBranchOrderItems(_branchId: number, orderId: number, body: unknown) {
  const parsed = addBranchOrderItemsBodySchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError('Invalid add order items body', 400);
  }

  const order =
    MOCK_OPEN_ORDERS.find((row) => row.id === orderId) ??
    MOCK_POS_ORDERS.find((row) => row.id === orderId);
  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  const orderRow = order as typeof order & { version?: number; items?: unknown[] };
  const currentVersion = orderRow.version ?? 0;
  const expectedVersion = parsed.data.expected_version;
  if (Number.isFinite(expectedVersion) && expectedVersion !== currentVersion) {
    throw new ApiError('Order version conflict', 409, 'ORDER_VERSION_CONFLICT');
  }

  const existingItems = Array.isArray(orderRow.items) ? orderRow.items : [];
  const nextIdStart = existingItems.length + 1;
  const addedLines = parsed.data.items.map((item, index) => ({
    id: nextIdStart + index,
    branch_menu_item_id: item.branch_menu_item_id,
    menu_item_id: item.branch_menu_item_id,
    item_name: `Item ${item.branch_menu_item_id}`,
    quantity: item.quantity,
    unit_price: 0,
    line_total: 0,
    item_status: 'draft',
    tags: item.tags,
  }));

  orderRow.version = currentVersion + 1;
  orderRow.items = [...existingItems, ...addedLines];

  return {
    success: true,
    data: {
      order_id: order.id,
      expected_version: orderRow.version,
      order: {
        ...order,
        branch_id: _branchId,
        version: orderRow.version,
        items: orderRow.items,
      },
    },
    message: 'Items added',
    request_id: 'mock-branch-order-items',
  };
}

/** DELETE /v1/branches/{branch_id}/orders/{order_id}/items/{item_id} */
function removeBranchOrderItem(
  _branchId: number,
  orderId: number,
  itemId: number,
  params?: { expected_version?: unknown },
) {
  const order =
    MOCK_OPEN_ORDERS.find((row) => row.id === orderId) ??
    MOCK_POS_ORDERS.find((row) => row.id === orderId);
  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  const orderRow = order as typeof order & { version?: number; items?: { id: number }[] };
  const currentVersion = orderRow.version ?? 0;
  const expectedVersion =
    params?.expected_version != null ? Number(params.expected_version) : currentVersion;
  if (Number.isFinite(expectedVersion) && expectedVersion !== currentVersion) {
    throw new ApiError('Order version conflict', 409, 'ORDER_VERSION_CONFLICT');
  }

  const existingItems = Array.isArray(orderRow.items) ? orderRow.items : [];
  const nextItems = existingItems.filter((row) => row.id !== itemId);
  if (nextItems.length === existingItems.length) {
    throw new ApiError('Order item not found', 404);
  }

  orderRow.version = currentVersion + 1;
  orderRow.items = nextItems;

  return {
    success: true,
    data: {
      order_id: order.id,
      expected_version: orderRow.version,
      order: {
        ...order,
        branch_id: _branchId,
        version: orderRow.version,
        items: orderRow.items,
      },
    },
    message: 'Item removed',
    request_id: 'mock-branch-order-item-remove',
  };
}

/** POST /v1/branches/{branch_id}/orders/{order_id}/submit */
function submitBranchOrder(_branchId: number, orderId: number, body: unknown) {
  const order =
    MOCK_OPEN_ORDERS.find((row) => row.id === orderId) ??
    MOCK_POS_ORDERS.find((row) => row.id === orderId);
  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  const expectedVersion =
    body && typeof body === 'object' && 'expected_version' in body
      ? Number((body as { expected_version: unknown }).expected_version)
      : 0;

  const orderRow = order as typeof order & { version?: number };
  const currentVersion = orderRow.version ?? 0;

  if (Number.isFinite(expectedVersion) && expectedVersion !== currentVersion) {
    throw new ApiError('Order version conflict', 409, 'ORDER_VERSION_CONFLICT');
  }

  order.kitchen_badge = 'kot_sent';
  if (order.status === 'draft' || order.status === 'open') {
    order.status = 'submitted';
  }
  orderRow.version = currentVersion + 1;

  const kotNumber = `KOT-${order.id}-${orderRow.version}`;
  const settle = getMockOrderSettleDetail(String(orderId));
  const submittedItems = settle.items.map((item, index) => ({
    id: index + 1,
    branch_menu_item_id: index + 1,
    menu_item_id: index + 1,
    item_name: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.totalPrice,
    item_status: 'submitted',
    kot_number: kotNumber,
  }));

  return {
    success: true,
    data: {
      order_id: order.id,
      expected_version: orderRow.version,
      kot_number: kotNumber,
      submitted_item_count: submittedItems.length || 1,
      order: {
        ...order,
        version: orderRow.version,
        items: submittedItems,
      },
    },
    message: 'Order submitted to kitchen',
    request_id: 'mock-branch-order-submit',
  };
}

/** GET /v1/branches/{branch_id}/orders/{order_id} — order detail with line items. */
function openOrderDetail(_branchId: number, orderId: number) {
  const order =
    MOCK_OPEN_ORDERS.find((row) => row.id === orderId) ??
    MOCK_POS_ORDERS.find((row) => row.id === orderId);

  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  const settle = getMockOrderSettleDetail(String(orderId));
  const items = settle.items.map((item, index) => ({
    id: index + 1,
    menu_item_id: index + 1,
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.totalPrice,
    notes: null,
    status: 'ordered',
  }));

  return {
    success: true,
    data: {
      id: order.id,
      public_id: order.public_id,
      order_number: order.order_number,
      order_type: order.order_type,
      branch_id: _branchId,
      table_id: order.table_id,
      table_name: order.table_name,
      floor_id: order.floor_id,
      section_id: order.section_id,
      guest_count: order.guest_count,
      version: (order as { version?: number }).version ?? 1,
      status: order.status,
      kitchen_badge: order.kitchen_badge,
      payment_status: order.payment_status,
      grand_total: order.grand_total,
      subtotal: settle.subtotal,
      opened_at: order.opened_at,
      items,
    },
    message: 'Order retrieved',
    request_id: 'mock-branch-order-detail',
  };
}

/** GET /v1/branches/{branch_id}/orders — returns the mock rows as stored. */
function openOrdersList(branchId: number, params?: QueryParams) {
  const status = typeof params?.status === 'string' ? params.status : 'open';
  const orderType = typeof params?.order_type === 'string' ? params.order_type : undefined;
  const search = typeof params?.search === 'string' ? params.search.trim().toLowerCase() : '';
  const floorId = queryNumber(params, 'floor_id');
  const sectionId = queryNumber(params, 'section_id');
  const page = queryNumber(params, 'page') ?? 1;
  const pageSize = queryNumber(params, 'page_size') ?? 15;
  const branchTableIds = new Set(
    tables.filter((table) => table.branch_id === branchId).map((table) => table.id),
  );

  const filtered =
    status === 'open'
      ? MOCK_OPEN_ORDERS.filter((order) => {
          // Dine-in must belong to this branch's tables; counter/delivery may have null table_id.
          if (order.table_id != null && !branchTableIds.has(order.table_id)) return false;
          if (orderType && order.order_type !== orderType) return false;
          if (floorId != null && order.floor_id !== floorId) return false;
          if (sectionId != null && order.section_id !== sectionId) return false;
          if (search) {
            const haystack = [
              order.order_number,
              order.table_name,
              order.order_type,
              order.kitchen_badge,
              order.public_id,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            if (!haystack.includes(search)) return false;
          }
          return true;
        })
      : [];

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    success: true,
    data: {
      items,
      total: filtered.length,
      page,
      page_size: pageSize,
    },
    message: 'Orders retrieved',
    request_id: 'mock-branch-orders',
  };
}

function queryNumber(params: QueryParams | undefined, key: string): number | undefined {
  const value = params?.[key];
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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
>(current: T): T {
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
