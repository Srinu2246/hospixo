import { describe, expect, it } from 'vitest';

import { floors } from '@/features/floor-table-setup/config';
import {
  computeFloorStatsFromTables,
  filterHistoryEntries,
  floorToDraftForm,
  floorToSetupDraft,
  historyForFloor,
  paginate,
  parseFloorDetailTab,
  tablesForFloor,
  tablesForSection,
} from '@/features/floor-table-setup/lib/detail';

const ground = floors.find((floor) => floor.id === 'ground');

describe('floor detail helpers', () => {
  it('falls back to overview for unknown tabs', () => {
    expect(parseFloorDetailTab('tables')).toBe('tables');
    expect(parseFloorDetailTab('unknown')).toBe('overview');
    expect(parseFloorDetailTab(null)).toBe('overview');
  });

  it('maps a floor into the reusable draft form', () => {
    expect(ground).toBeDefined();
    if (!ground) return;
    const form = floorToDraftForm(ground);
    expect(form.name).toBe('Ground Floor');
    expect(form.code).toBe('GF-001');
    expect(form.active).toBe(true);
  });

  it('returns API tables when present and nothing when absent', () => {
    expect(ground).toBeDefined();
    if (!ground) return;
    expect(tablesForFloor(ground)).toEqual([]);

    const withTables = {
      ...ground,
      tables: [
        {
          id: 't1',
          number: 'T001',
          capacity: 4,
          status: 'available' as const,
          configStatus: 'active' as const,
          reservations: true,
          area: 'Main Dining',
          shape: 'square' as const,
          sectionId: 'main-dining',
        },
      ],
    };
    const tables = tablesForFloor(withTables);
    expect(tables).toHaveLength(1);
    expect(tablesForSection(tables, 'main-dining').every((table) => table.area)).toBe(true);
    const draft = floorToSetupDraft(withTables);
    expect(draft.floor.name).toBe('Ground Floor');
    expect(draft.sections.length).toBeGreaterThan(0);
    expect(draft.tables).toEqual([
      expect.objectContaining({ id: 't1', number: 'T001', sectionId: 'main-dining' }),
    ]);
  });

  it('filters history by action and query', () => {
    expect(ground).toBeDefined();
    if (!ground) return;
    const { general } = historyForFloor(ground);
    const created = filterHistoryEntries(general, '', 'create', '');
    expect(created.every((entry) => entry.action === 'create')).toBe(true);
    expect(filterHistoryEntries(general, 'main dining', 'all', '')).not.toHaveLength(0);
  });

  it('paginates without going out of range', () => {
    const result = paginate(['a', 'b', 'c'], 9, 2);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.items).toEqual(['c']);
  });

  it('counts tables in inactive sections as inactive', () => {
    const stats = computeFloorStatsFromTables(
      [
        {
          id: '1',
          number: 'T1',
          capacity: 4,
          status: 'available',
          configStatus: 'active',
          reservations: false,
          area: 'AC',
          shape: 'square',
          sectionId: 'ac',
        },
        {
          id: '2',
          number: 'T2',
          capacity: 4,
          status: 'available',
          configStatus: 'active',
          reservations: false,
          area: 'NON AC',
          shape: 'square',
          sectionId: 'non-ac',
        },
      ],
      [
        {
          id: 'ac',
          name: 'AC',
          status: 'active',
          tableCount: 1,
          seatCount: 4,
        },
        {
          id: 'non-ac',
          name: 'NON AC',
          status: 'inactive',
          tableCount: 1,
          seatCount: 4,
        },
      ],
    );

    expect(stats.activeTables).toBe(1);
    expect(stats.inactiveTables).toBe(1);
  });
});
