import { describe, expect, it } from 'vitest';

import {
  createEmptyDraft,
  createSectionDraft,
  filterByQuery,
  generateTableNumbers,
  generateTables,
  getNextTableNumber,
  isInternalItemsError,
  NEW_TABLE_SECTION_ID,
  nextEntityCode,
  nextTableNumber,
  parseTableNumber,
  parseTableSectionChoice,
  syncSectionStats,
  validateTableNumberRange,
} from '@/features/floor-table-setup/lib/draft';

describe('floor setup draft helpers', () => {
  it('starts from empty floor defaults', () => {
    const draft = createEmptyDraft();
    expect(draft.floor.name).toBe('');
    expect(draft.floor.code).toBe('');
    expect(draft.sections).toHaveLength(0);
    expect(draft.tables).toHaveLength(0);
  });

  it('generates sequential table numbers', () => {
    const tables = generateTables({
      startNumber: 'T008',
      count: 3,
      capacity: 4,
      reservations: true,
      existing: [],
    });

    expect(tables.map((table) => table.number)).toEqual(['T008', 'T009', 'T010']);
    expect(tables.every((table) => table.capacity === 4)).toBe(true);
  });

  it('suggests the next section code and table number', () => {
    expect(nextEntityCode('SEC', [{ code: 'SEC-001' }])).toBe('SEC-002');
    expect(nextEntityCode('SEC', [{ code: 'SEC-001' }, { code: 'SEC-010' }])).toBe('SEC-011');
    expect(nextTableNumber([{ number: 'T001' }])).toBe('T002');
    expect(nextTableNumber([{ number: 'T001' }, { number: 'T010' }])).toBe('T011');
    expect(nextTableNumber([])).toBe('T001');
  });

  it('syncs section stats by section id', () => {
    const sections = [
      createSectionDraft({
        name: 'Default',
        code: 'SEC-001',
        description: '',
        active: true,
      }),
      createSectionDraft({
        name: 'Family',
        code: 'SEC-002',
        description: '',
        active: true,
      }),
    ];
    const tables = generateTables({
      startNumber: 'T001',
      count: 2,
      capacity: 4,
      reservations: false,
      existing: [],
    }).map((table, index) => ({
      ...table,
      sectionId: sections[index === 0 ? 1 : 0]?.id,
    }));

    const synced = syncSectionStats(sections, tables);
    expect(synced[0]?.tableCount).toBe(1);
    expect(synced[1]?.tableCount).toBe(1);
    expect(synced[0]?.seatCount).toBe(4);
    expect(synced[1]?.seatCount).toBe(4);
  });

  it('parses add-table section as existing, new, or missing', () => {
    expect(parseTableSectionChoice({ sectionId: 'sec-1' })).toEqual({
      kind: 'existing',
      sectionId: 'sec-1',
    });
    expect(
      parseTableSectionChoice({
        sectionId: NEW_TABLE_SECTION_ID,
        newSection: { name: ' Main Dining ', code: ' SEC-001 ' },
      }),
    ).toEqual({
      kind: 'new',
      section: { name: 'Main Dining', code: 'SEC-001' },
    });
    expect(parseTableSectionChoice({ sectionId: NEW_TABLE_SECTION_ID })).toEqual({
      kind: 'missing',
    });
  });

  it('hides raw API items validation messages', () => {
    expect(
      isInternalItemsError(
        'items: List should have at least 2 items after validation, not 1 (received [object Object])',
      ),
    ).toBe(true);
    expect(isInternalItemsError('Select a branch to continue.')).toBe(false);
  });

  it('parses table numbers with prefix and width', () => {
    expect(parseTableNumber('T001')).toEqual({ prefix: 'T', number: 1, width: 3 });
    expect(parseTableNumber('A12')).toEqual({ prefix: 'A', number: 12, width: 2 });
    expect(parseTableNumber('invalid')).toBeNull();
  });

  it('generates a preview range from a starting number', () => {
    expect(generateTableNumbers('T008', 3)).toEqual(['T008', 'T009', 'T010']);
    expect(generateTableNumbers('A12', 2)).toEqual(['A12', 'A13']);
  });

  it('getNextTableNumber mirrors nextTableNumber', () => {
    expect(getNextTableNumber([{ number: 'T005' }])).toBe('T006');
  });

  it('rejects duplicate table numbers in a bulk range', () => {
    const existing = [{ number: 'T009' }, { number: 'T010' }];
    expect(validateTableNumberRange(existing, 'T008', 3)).toEqual({
      ok: false,
      message: expect.stringContaining('already exist'),
      conflicts: expect.arrayContaining(['T009', 'T010']),
    });
    expect(validateTableNumberRange(existing, 'T011', 2)).toEqual({ ok: true });
  });

  it('detects duplicates case-insensitively', () => {
    const existing = [{ number: 't001' }];
    expect(validateTableNumberRange(existing, 'T001', 1).ok).toBe(false);
  });

  it('filters sections by query', () => {
    const section = createSectionDraft({
      name: 'Main Dining',
      code: 'MD-001',
      description: '',
      active: true,
    });
    expect(filterByQuery([section], 'main', (item) => item.name)).toHaveLength(1);
    expect(filterByQuery([section], 'bar', (item) => item.name)).toHaveLength(0);
  });
});
