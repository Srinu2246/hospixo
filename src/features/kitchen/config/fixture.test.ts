import { describe, expect, it } from 'vitest';

import {
  kitchenPreviewConnection,
  kitchenPreviewOrders,
  kitchenPreviewStats,
} from '@/features/kitchen/config/fixture';

describe('kitchen fixtures', () => {
  it('provides preview orders spanning all board statuses', () => {
    expect(kitchenPreviewOrders.length).toBeGreaterThan(0);
    expect(kitchenPreviewOrders.some((order) => order.status === 'new')).toBe(true);
    expect(kitchenPreviewOrders.some((order) => order.status === 'preparing')).toBe(true);
    expect(kitchenPreviewOrders.some((order) => order.status === 'ready')).toBe(true);
  });

  it('provides aggregate stats and connection preview values', () => {
    expect(kitchenPreviewStats.total).toBe(324);
    expect(kitchenPreviewConnection.printerConnected).toBe(true);
    expect(kitchenPreviewConnection.avgPrepTimeLabel).toBe('14m 30s');
  });
});
