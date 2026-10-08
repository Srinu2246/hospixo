import { describe, expect, it } from 'vitest';

import {
  countEightySixed,
  filterMenuItems,
  getMenuStats,
  isCategoryEnabled,
} from '@/features/pos/menu-availability/lib';
import type { MenuItem } from '@/features/pos/types/menu-availability';

const items: MenuItem[] = [
  {
    id: 'a',
    name: 'Veg Biryani',
    categoryId: 'veg',
    tags: ['Biryani'],
    diet: 'veg',
    status: 'available',
    visibility: 'Online',
    channels: ['all', 'zomato'],
    surfaces: ['all', 'online'],
  },
  {
    id: 'b',
    name: 'Paneer Biryani',
    categoryId: 'veg',
    tags: ['Main Course'],
    diet: 'veg',
    status: '86d',
    visibility: 'Online',
    channels: ['all', 'swiggy'],
    surfaces: ['all', 'online'],
  },
  {
    id: 'c',
    name: 'Secret Soup',
    categoryId: 'soups',
    tags: ['Soup'],
    diet: 'veg',
    status: 'hidden',
    visibility: 'Hidden',
    channels: ['all', 'hotel-mayukha'],
    surfaces: ['all', 'dinein_qr'],
  },
];

describe('menu-availability stats helpers', () => {
  it('computes availability stats', () => {
    expect(getMenuStats(items)).toEqual({
      total: 3,
      available: 1,
      eightySixed: 1,
      hidden: 1,
    });
    expect(getMenuStats([])).toEqual({
      total: 0,
      available: 0,
      eightySixed: 0,
      hidden: 0,
    });
  });

  it('filters by surface, channel, category, status, and query', () => {
    expect(
      filterMenuItems({
        items,
        surface: 'online',
        channelId: 'all',
        categoryId: null,
        statusFilter: 'total',
        query: '',
      }).map((item) => item.id),
    ).toEqual(['a', 'b']);

    expect(
      filterMenuItems({
        items,
        surface: 'all',
        channelId: 'zomato',
        categoryId: null,
        statusFilter: 'total',
        query: '',
      }).map((item) => item.id),
    ).toEqual(['a']);

    expect(
      filterMenuItems({
        items,
        surface: 'all',
        channelId: 'all',
        categoryId: 'soups',
        statusFilter: 'total',
        query: '',
      }).map((item) => item.id),
    ).toEqual(['c']);

    expect(
      filterMenuItems({
        items,
        surface: 'all',
        channelId: 'all',
        categoryId: null,
        statusFilter: '86d',
        query: '',
      }).map((item) => item.id),
    ).toEqual(['b']);

    expect(
      filterMenuItems({
        items,
        surface: 'all',
        channelId: 'all',
        categoryId: null,
        statusFilter: 'total',
        query: '  soup  ',
      }).map((item) => item.id),
    ).toEqual(['c']);

    expect(
      filterMenuItems({
        items,
        surface: 'all',
        channelId: 'all',
        categoryId: null,
        statusFilter: 'total',
        query: 'main',
      }).map((item) => item.id),
    ).toEqual(['b']);
  });

  it("evaluates category enabled state and 86'd counts", () => {
    expect(isCategoryEnabled(items, 'missing')).toBe(true);
    expect(isCategoryEnabled(items, 'veg')).toBe(true);
    expect(
      isCategoryEnabled(
        items.filter((item) => item.status !== 'available'),
        'veg',
      ),
    ).toBe(false);
    expect(countEightySixed(items)).toBe(1);
  });
});
