import { describe, expect, it } from 'vitest';

import { mapBranchMenuItemsToDineIn } from '@/features/pos/lib/map-branch-menu-to-dine-in';

describe('mapBranchMenuItemsToDineIn', () => {
  it('maps numeric override ids and nested menu_item names', () => {
    const items = mapBranchMenuItemsToDineIn([
      {
        id: 42,
        menu_item_id: 99,
        selling_price: 120,
        allow_dine_in: true,
        menu_item: { id: 99, name: 'Paneer Tikka', base_price: 100 },
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe('99');
    expect(items[0]?.name).toBe('Paneer Tikka');
    expect(items[0]?.price).toBe(120);
  });

  it('deduplicates rows that share the same menu_item_id', () => {
    const items = mapBranchMenuItemsToDineIn([
      {
        id: 10,
        menu_item_id: 36,
        selling_price: 100,
        menu_item: { id: 36, name: 'Duplicate A' },
      },
      {
        id: 11,
        menu_item_id: 36,
        selling_price: 120,
        menu_item: { id: 36, name: 'Duplicate B' },
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe('36');
    expect(items[0]?.price).toBe(120);
  });

  it('skips items not allowed for dine-in', () => {
    const items = mapBranchMenuItemsToDineIn([
      {
        id: 1,
        allow_dine_in: false,
        menu_item: { id: 1, name: 'Takeaway Only' },
      },
    ]);

    expect(items).toHaveLength(0);
  });
});
