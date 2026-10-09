import { describe, expect, it } from 'vitest';

import {
  isOnlineAggregatorRecord,
  mapOnlineOrderRecord,
  mapOpenOrderRecord,
} from '@/features/pos/lib/branch-order-mappers';

describe('branch-order-mappers', () => {
  it('maps open dine-in orders', () => {
    const order = mapOpenOrderRecord({
      id: '42',
      order_number: '#1042',
      order_type: 'dine_in',
      table_label: 'Table T4',
      kitchen_status: 'preparing',
      payment_status: 'unpaid',
      total: 882,
    });
    expect(order?.type).toBe('dineIn');
    expect(order?.orderNumber).toBe('#1042');
  });

  it('detects online aggregator records', () => {
    expect(
      isOnlineAggregatorRecord({
        id: '1',
        channel: 'swiggy',
        order_number: '#SW1',
      }),
    ).toBe(true);
  });

  it('maps online swiggy orders', () => {
    const order = mapOnlineOrderRecord({
      id: 'sw1',
      channel: 'swiggy',
      order_number: '#SW1024',
      status: 'pending',
      total: 680,
      payment_status: 'paid',
      items: [{ name: 'Paneer Tikka', quantity: 2 }],
    });
    expect(order?.channel).toBe('swiggy');
    expect(order?.actionState).toBe('pendingAccept');
  });
});
