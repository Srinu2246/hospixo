import { describe, expect, it } from 'vitest';

import { floors } from '@/features/floor-table-setup/config';
import { createDraftFloor, filterFloors } from '@/features/floor-table-setup/lib/filter-floors';

describe('filterFloors', () => {
  it('filters by search query', () => {
    const result = filterFloors({
      floors,
      query: 'rooftop',
      status: 'all',
      sort: 'name',
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('rooftop');
  });

  it('filters by status', () => {
    const result = filterFloors({
      floors,
      query: '',
      status: 'draft',
      sort: 'name',
    });

    expect(result.every((floor) => floor.status === 'draft')).toBe(true);
    expect(result.map((floor) => floor.id)).toEqual(['banquet']);
  });

  it('sorts by table count descending', () => {
    const result = filterFloors({
      floors,
      query: '',
      status: 'all',
      sort: 'tables',
    });

    expect(result[0]?.id).toBe('banquet');
    expect(result.at(-1)?.id).toBe('vip');
  });
});

describe('createDraftFloor', () => {
  it('creates a draft floor from the form values', () => {
    const floor = createDraftFloor('Mezzanine');

    expect(floor.name).toBe('Mezzanine');
    expect(floor.type).toBeNull();
    expect(floor.status).toBe('draft');
    expect(floor.tableCount).toBe(0);
  });
});
