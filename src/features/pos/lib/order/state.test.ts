import { describe, expect, it } from 'vitest';

import { dineInInitialOrderLines } from '@/features/pos/config/dine-in';

import {
  INITIAL_ORDER_SEQUENCE,
  createMenuQuantitiesFromLines,
  formatPosOrderNumber,
  getEmptyPosOrderState,
  getDemoPosOrderState,
  getTableLabel,
} from './state';

describe('pos order state helpers', () => {
  it('formats order numbers with a fixed-width sequence', () => {
    expect(formatPosOrderNumber(INITIAL_ORDER_SEQUENCE)).toBe('#0039');
    expect(formatPosOrderNumber(40)).toBe('#0040');
  });

  it('builds menu quantities from order lines', () => {
    expect(createMenuQuantitiesFromLines(dineInInitialOrderLines)).toEqual({
      'pasta-carbonara': 6,
      'caesar-salad': 2,
    });
  });

  it('returns an empty cart for the next order', () => {
    expect(getEmptyPosOrderState()).toEqual({
      selectedTableId: 't1',
      orderLines: [],
      menuQuantities: {},
    });
  });

  it('returns the demo seed state for first-load previews', () => {
    const demo = getDemoPosOrderState();
    expect(demo.orderLines).toHaveLength(dineInInitialOrderLines.length);
    expect(demo.menuQuantities['pasta-carbonara']).toBeGreaterThan(0);
  });

  it('derives a readable table label from the selected table id', () => {
    expect(getTableLabel('t1')).toBe('Table 01');
  });
});
