import type {
  FloorDetailTab,
  FloorDetails,
  FloorSort,
  FloorType,
  SavedFloor,
  SectionDraft,
  SectionInput,
  TableDraft,
  TableGenerateInput,
  WizardStep,
} from '@/features/management/floor-and-table-setup/types/floorSetup';

export type FloorRouteStep = 'hub' | WizardStep | 'success';

export type FloorSetupDraft = {
  floors: SavedFloor[];
  details: FloorDetails;
  sections: SectionDraft[];
  tables: TableDraft[];
  createdId: string | null;
};

const STEP_SUFFIX = /\/(floor|section|table|review|success)$/;

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function suggestCode(name: string, serial: number, fallback: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 3);
  return `${initials || fallback}-${String(serial).padStart(3, '0')}`;
}

export function emptyFloor(): FloorDetails {
  return {
    name: '',
    code: '',
    type: 'indoor',
    description: '',
    active: true,
  };
}

export function withFloorCode(details: FloorDetails): FloorDetails {
  const name = details.name.trim();
  return {
    ...details,
    name,
    code: details.code.trim() || suggestCode(name, 1, 'FL'),
    description: details.description.trim(),
  };
}

export function floorTypeLabel(type: FloorType | ''): string {
  if (type === 'outdoor') return 'Outdoor';
  if (type === 'vip') return 'VIP';
  if (type === 'banquet') return 'Banquet';
  if (type === 'indoor') return 'Indoor Dining';
  return 'Not set';
}

export function filterByName<T extends { name: string }>(items: readonly T[], query: string): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...items];
  return items.filter((item) => item.name.toLowerCase().includes(needle));
}

export function sectionStats(sectionId: string, tables: readonly TableDraft[]) {
  const owned = tables.filter((table) => table.sectionId === sectionId);
  return {
    tables: owned.length,
    seats: owned.reduce((total, table) => total + table.seats, 0),
  };
}

export function buildSection(input: SectionInput, serial: number): SectionDraft {
  return {
    id: createId(),
    name: input.name.trim(),
    code: input.code.trim() || suggestCode(input.name, serial, 'SEC'),
    description: input.description.trim(),
    active: input.active,
  };
}

export function insertSection(
  sections: readonly SectionDraft[],
  input: SectionInput,
): SectionDraft[] {
  return [...sections, buildSection(input, sections.length + 1)];
}

export function replaceSection(
  sections: readonly SectionDraft[],
  id: string,
  input: SectionInput,
): SectionDraft[] {
  return sections.map((section) =>
    section.id === id
      ? {
          ...section,
          ...input,
          name: input.name.trim(),
          code: input.code.trim() || section.code,
        }
      : section,
  );
}

export function removeSection(sections: readonly SectionDraft[], id: string): SectionDraft[] {
  return sections.filter((section) => section.id !== id);
}

export function unlinkSectionTables(
  tables: readonly TableDraft[],
  sectionId: string,
): TableDraft[] {
  return tables.map((table) =>
    table.sectionId === sectionId ? { ...table, sectionId: null } : table,
  );
}

export function filterTables(tables: readonly TableDraft[], query: string): TableDraft[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...tables];
  return tables.filter((table) => table.number.toLowerCase().includes(needle));
}

export function nextTableStart(tables: readonly TableDraft[]): string {
  return nextFreeNumber(
    tables.map((table) => table.number),
    'T001',
  );
}

export function generateTables(
  input: TableGenerateInput,
  existing: readonly TableDraft[],
  sectionIds: readonly string[],
): TableDraft[] {
  const count = Math.min(50, Math.max(1, Math.floor(input.count) || 1));
  const parsed = parseTableNumber(input.start.trim() || 'T001');
  const used = new Set(existing.map((table) => table.number));
  const created: TableDraft[] = [];
  let serial = parsed.serial;

  while (created.length < count && serial < parsed.serial + 500) {
    const number = formatTableNumber(parsed.prefix, serial);
    serial += 1;
    if (used.has(number)) continue;
    used.add(number);
    created.push({
      id: createId(),
      number,
      seats: input.seats,
      active: true,
      reservations: input.reservations,
      sectionId: sectionIds.length
        ? (sectionIds[created.length % sectionIds.length] ?? null)
        : null,
    });
  }

  return created;
}

export function appendTables(
  tables: readonly TableDraft[],
  input: TableGenerateInput,
  sectionIds: readonly string[],
): TableDraft[] {
  return [...tables, ...generateTables(input, tables, sectionIds)];
}

export function removeTable(tables: readonly TableDraft[], id: string): TableDraft[] {
  return tables.filter((table) => table.id !== id);
}

export function toggleTableActive(tables: readonly TableDraft[], id: string): TableDraft[] {
  return tables.map((table) => (table.id === id ? { ...table, active: !table.active } : table));
}

export function toggleAllTables(tables: readonly TableDraft[]): TableDraft[] {
  return tables.map((table) => ({ ...table, active: !table.active }));
}

export function totalSeats(tables: readonly TableDraft[]): number {
  return tables.reduce((total, table) => total + table.seats, 0);
}

export function reservationsOnline(tables: readonly TableDraft[]): boolean {
  return tables.some((table) => table.reservations);
}

export function buildSavedFloor(
  details: FloorDetails,
  sections: readonly SectionDraft[],
  tables: readonly TableDraft[],
): SavedFloor {
  return {
    id: createId(),
    details: withFloorCode(details),
    sections: [...sections],
    tables: [...tables],
    updatedAt: Date.now(),
  };
}

export function filterFloors(
  floors: readonly SavedFloor[],
  query: string,
  sort: FloorSort,
): SavedFloor[] {
  const needle = query.trim().toLowerCase();
  const matched = floors.filter((floor) => {
    if (!needle) return true;
    return (
      floor.details.name.toLowerCase().includes(needle) ||
      floor.details.code.toLowerCase().includes(needle)
    );
  });

  return [...matched].sort((left, right) => {
    if (sort === 'name') return left.details.name.localeCompare(right.details.name);
    if (sort === 'tables') return right.tables.length - left.tables.length;
    return right.updatedAt - left.updatedAt;
  });
}

export type FloorDetailRoute = {
  floorId: string;
  tab: FloorDetailTab;
  sectionId: string | null;
  editing: boolean;
};

const DETAIL_ROUTE =
  /\/floors\/([^/]+)(?:\/(overview|floor|sections|tables))?(?:\/([^/]+))?(?:\/(edit))?$/;

export function parseFloorRoute(pathname: string): { base: string; step: FloorRouteStep } {
  const normalized = pathname.replace(/\/$/, '') || '/';
  const detailAt = normalized.indexOf('/floors/');
  const root = detailAt === -1 ? normalized : normalized.slice(0, detailAt);
  const match = STEP_SUFFIX.exec(root);
  if (!match?.[1]) return { base: root, step: 'hub' };
  return {
    base: root.slice(0, -match[0].length),
    step: match[1] as FloorRouteStep,
  };
}

export function parseFloorDetailRoute(pathname: string): FloorDetailRoute | null {
  const match = DETAIL_ROUTE.exec(pathname.replace(/\/$/, ''));
  if (!match?.[1]) return null;
  const tab = match[2];
  return {
    floorId: decodeURIComponent(match[1]),
    tab: tab === 'floor' || tab === 'sections' || tab === 'tables' ? tab : 'overview',
    sectionId: match[3] ? decodeURIComponent(match[3]) : null,
    editing: match[4] === 'edit',
  };
}

export function floorDetailHref(
  base: string,
  floorId: string,
  tab: FloorDetailTab = 'overview',
  sectionId?: string,
  editing = false,
): string {
  const floor = encodeURIComponent(floorId);
  if (sectionId) {
    const section = encodeURIComponent(sectionId);
    const path = `${base}/floors/${floor}/sections/${section}`;
    return editing ? `${path}/edit` : path;
  }
  return `${base}/floors/${floor}/${tab}`;
}

export function floorStepHref(base: string, step: FloorRouteStep): string {
  if (step === 'hub') return base;
  return `${base}/${step}`;
}

export function isWizardStep(step: FloorRouteStep): step is WizardStep {
  return step === 'floor' || step === 'section' || step === 'table' || step === 'review';
}

const EMPTY_DRAFT: FloorSetupDraft = {
  floors: [],
  details: emptyFloor(),
  sections: [],
  tables: [],
  createdId: null,
};

const listeners = new Set<() => void>();
let hydrated = false;
const cache = new Map<string, { raw: string; value: FloorSetupDraft }>();

function storageKey(routeBase: string): string {
  return `hospixo.floor-setup:${routeBase}`;
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeFloorSetup(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getFloorSetupServerSnapshot(): FloorSetupDraft {
  return EMPTY_DRAFT;
}

export function markFloorSetupHydrated(): void {
  if (hydrated) return;
  hydrated = true;
  notify();
}

export function getFloorSetupSnapshot(routeBase: string): FloorSetupDraft {
  if (!hydrated || typeof window === 'undefined') return EMPTY_DRAFT;
  const key = storageKey(routeBase);
  const raw = window.localStorage.getItem(key) ?? '';
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value;
  const value = raw ? parseDraft(raw) : EMPTY_DRAFT;
  cache.set(key, { raw, value });
  return value;
}

export function writeFloorSetup(routeBase: string, draft: FloorSetupDraft): void {
  if (!hydrated || typeof window === 'undefined') return;
  const key = storageKey(routeBase);
  const raw = JSON.stringify(draft);
  const hit = cache.get(key);
  if (hit?.raw === raw) return;
  window.localStorage.setItem(key, raw);
  cache.set(key, { raw, value: draft });
  notify();
}

function nextFreeNumber(existing: readonly string[], start: string): string {
  const parsed = parseTableNumber(start);
  const used = new Set(existing);
  let serial = parsed.serial;
  let candidate = formatTableNumber(parsed.prefix, serial);
  while (used.has(candidate)) {
    serial += 1;
    candidate = formatTableNumber(parsed.prefix, serial);
  }
  return candidate;
}

function parseTableNumber(value: string): { prefix: string; serial: number } {
  const match = /^([A-Za-z]*)(\d+)$/.exec(value.trim());
  if (!match) return { prefix: 'T', serial: 1 };
  return { prefix: match[1] || 'T', serial: Number(match[2]) || 1 };
}

function formatTableNumber(prefix: string, serial: number): string {
  return `${prefix}${String(serial).padStart(3, '0')}`;
}

function parseDraft(raw: string): FloorSetupDraft {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return EMPTY_DRAFT;
    const record = value as Record<string, unknown>;
    return {
      floors: Array.isArray(record.floors) ? record.floors.filter(isSavedFloor) : [],
      details: isFloorDetails(record.details) ? record.details : emptyFloor(),
      sections: Array.isArray(record.sections) ? record.sections.filter(isSection) : [],
      tables: Array.isArray(record.tables) ? record.tables.filter(isTable) : [],
      createdId: typeof record.createdId === 'string' ? record.createdId : null,
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

function isFloorType(value: unknown): value is FloorType | '' {
  return (
    value === 'indoor' ||
    value === 'outdoor' ||
    value === 'vip' ||
    value === 'banquet' ||
    value === ''
  );
}

function isFloorDetails(value: unknown): value is FloorDetails {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.name === 'string' &&
    typeof record.code === 'string' &&
    typeof record.description === 'string' &&
    typeof record.active === 'boolean' &&
    isFloorType(record.type)
  );
}

function isSection(value: unknown): value is SectionDraft {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.code === 'string' &&
    typeof record.description === 'string' &&
    typeof record.active === 'boolean'
  );
}

function isTable(value: unknown): value is TableDraft {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.number === 'string' &&
    typeof record.seats === 'number' &&
    typeof record.active === 'boolean' &&
    typeof record.reservations === 'boolean' &&
    (record.sectionId === null || typeof record.sectionId === 'string')
  );
}

function isSavedFloor(value: unknown): value is SavedFloor {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.updatedAt === 'number' &&
    isFloorDetails(record.details) &&
    Array.isArray(record.sections) &&
    record.sections.every(isSection) &&
    Array.isArray(record.tables) &&
    record.tables.every(isTable)
  );
}
