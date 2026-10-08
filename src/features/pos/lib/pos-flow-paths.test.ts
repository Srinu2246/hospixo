import { describe, expect, it } from 'vitest';

import { flowPaths } from '@/config/shell/flow-paths';
import { routes } from '@/config/routes';
import { resolvePosFlowId, resolvePosFlowPaths } from '@/features/pos/lib/pos-flow-paths';

describe('resolvePosFlowPaths', () => {
  it('detects captain, branch, and platform flows', () => {
    expect(resolvePosFlowId('/captain')).toBe('captain');
    expect(resolvePosFlowId('/captain/dine-in')).toBe('captain');
    expect(resolvePosFlowId('/branch/tables')).toBe('branch');
    expect(resolvePosFlowId('/dine-in')).toBe('platform');
    expect(resolvePosFlowId('/tables')).toBe('platform');
  });

  it('keeps captain navigation inside /captain', () => {
    const paths = resolvePosFlowPaths('/captain/dine-in');
    expect(paths.id).toBe('captain');
    expect(paths.tables).toBe(flowPaths.captain.tables);
    expect(paths.dineIn).toBe(flowPaths.captain.dineIn);
    expect(paths.checkout).toBe(flowPaths.captain.checkout);
    expect(paths.paymentSuccess).toBe(flowPaths.captain.paymentSuccess);
    expect(paths.orders).toBe(flowPaths.captain.orders);
    expect(paths.ready).toBe(flowPaths.captain.ready);
  });

  it('uses platform POS flat routes by default', () => {
    const paths = resolvePosFlowPaths('/checkout-payment');
    expect(paths.id).toBe('platform');
    expect(paths.tables).toBe(routes.platform.pos.tables);
    expect(paths.dineIn).toBe(routes.platform.pos.dineIn);
    expect(paths.checkout).toBe(routes.platform.pos.checkoutPayment);
    expect(paths.paymentSuccess).toBe(routes.platform.pos.paymentSuccess);
    expect(paths.orders).toBe(routes.platform.pos.openOrders);
    expect(paths.ready).toBe(routes.platform.pos.readyList);
  });

  it('scopes branch table and dine-in under /branch', () => {
    const paths = resolvePosFlowPaths('/branch/tables');
    expect(paths.id).toBe('branch');
    expect(paths.tables).toBe(flowPaths.branch.tables);
    expect(paths.dineIn).toBe(flowPaths.branch.dineIn);
    expect(paths.orders).toBe(flowPaths.branch.orders);
  });
});
