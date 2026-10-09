import { describe, expect, it } from 'vitest';

import {
  formatOpenOrderAmount,
  formatOpenOrderTime,
  getKitchenStatusLabel,
  getOpenOrderTypeLabel,
  buildOpenOrdersSummary,
  getOpenOrdersSummaryText,
  getPaymentStatusLabel,
  openOrders,
  resolveOpenOrderAmount,
} from '@/features/pos/config/open-orders';
import { orderDetailsSeedLines } from '@/features/pos/config/order-details';

describe('open orders helpers', () => {
  it('formats order amounts', () => {
    expect(formatOpenOrderAmount(882)).toBe('Rs.882');
    expect(formatOpenOrderAmount(1250)).toBe('Rs.1,250');
  });

  it('resolves amount from line items when present', () => {
    const order = openOrders[0]!;
    expect(resolveOpenOrderAmount({ ...order, lines: orderDetailsSeedLines })).toBe(1980);
  });

  it('formats elapsed time labels', () => {
    expect(formatOpenOrderTime('12m')).toBe('12 min ago');
    expect(formatOpenOrderTime('now')).toBe('Just now');
  });

  it('returns readable type labels', () => {
    expect(getOpenOrderTypeLabel('dineIn')).toBe('Dine-In');
    expect(getOpenOrderTypeLabel('online')).toBe('Online');
  });

  it('returns readable kitchen and payment status labels', () => {
    expect(getKitchenStatusLabel('kotSent')).toBe('KOT Sent');
    expect(getKitchenStatusLabel('billing')).toBe('Billing');
    expect(getKitchenStatusLabel('unknown' as never)).toBe('unknown');
    expect(getPaymentStatusLabel('paid')).toBe('Paid');
    expect(getPaymentStatusLabel('unpaid')).toBe('Unpaid');
  });

  it('builds the footer summary text from order rows', () => {
    expect(buildOpenOrdersSummary(openOrders)).toBe(
      'Showing 6 running orders • 3 awaiting kitchen, 3 ready to settle',
    );
    expect(getOpenOrdersSummaryText()).toBe(buildOpenOrdersSummary(openOrders));
  });
});
