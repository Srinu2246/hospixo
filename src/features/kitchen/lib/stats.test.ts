import { describe, expect, it } from 'vitest';

import { kitchenPreviewOrders } from '@/features/kitchen/config/fixture';
import {
  filterOrdersByStation,
  filterOrdersByStatus,
  getKitchenStats,
  removeOrder,
  setOrderStatus,
} from '@/features/kitchen/lib/stats';

describe('kitchen stats helpers', () => {
  it('aggregates counts by status', () => {
    expect(getKitchenStats(kitchenPreviewOrders)).toEqual({
      total: 6,
      pending: 2,
      preparing: 2,
      ready: 2,
    });
  });

  it('filters orders by station and status', () => {
    expect(filterOrdersByStation(kitchenPreviewOrders, 'tandoor')).toEqual([]);
    expect(filterOrdersByStatus(kitchenPreviewOrders, 'ready')).toHaveLength(2);
    expect(filterOrdersByStatus(kitchenPreviewOrders, 'new').map((order) => order.number)).toEqual([
      '1021',
      '1024',
    ]);
  });

  it('updates and removes orders for board actions', () => {
    const preparing = setOrderStatus(kitchenPreviewOrders, 'ord-1021', 'preparing');
    expect(preparing.find((order) => order.id === 'ord-1021')?.status).toBe('preparing');

    const withoutReady = removeOrder(kitchenPreviewOrders, 'ord-1018');
    expect(withoutReady.some((order) => order.id === 'ord-1018')).toBe(false);
    expect(withoutReady).toHaveLength(kitchenPreviewOrders.length - 1);
  });
});
