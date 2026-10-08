import { describe, expect, it } from 'vitest';

import { resolvePosFlowPaths } from '@/features/pos/lib/pos-flow-paths';
import { computeLinesAmount } from '@/features/pos/lib/order/lines';
import { resolveTableIdFromReference } from '@/features/pos/lib/order/reference';
import { mapKitchenStatusToOpenOrder } from '@/features/pos/lib/order/kitchen-status';

describe('order lib helpers', () => {
  it('parses table references', () => {
    expect(resolveTableIdFromReference('Table T4')).toBe('t04');
    expect(resolveTableIdFromReference('T2')).toBe('t02');
  });

  it('maps kitchen statuses to open-order statuses', () => {
    expect(mapKitchenStatusToOpenOrder('new')).toBe('kotSent');
    expect(mapKitchenStatusToOpenOrder('preparing')).toBe('preparing');
    expect(mapKitchenStatusToOpenOrder('ready')).toBe('ready');
  });

  it('computes line amounts', () => {
    expect(
      computeLinesAmount([
        {
          id: 'l1',
          menuItemId: 'a',
          name: 'A',
          price: 100,
          quantity: 2,
          imageUrl: '/a.jpg',
        },
      ]),
    ).toBe(200);
  });
});

describe('resolvePosFlowPaths orderDetails', () => {
  it('builds order detail routes per flow', () => {
    expect(resolvePosFlowPaths('/captain/orders').orderDetails('o1')).toBe('/captain/orders/o1');
    expect(resolvePosFlowPaths('/open-orders').orderDetails('o1')).toBe('/open-orders/o1');
    expect(resolvePosFlowPaths('/branch/orders').orderDetails('o1')).toBe('/branch/orders/o1');
  });
});
