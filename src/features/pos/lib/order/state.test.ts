import { describe, expect, it } from 'vitest';

import {
  INITIAL_ORDER_SEQUENCE,
  createMenuQuantitiesFromLines,
  formatPosOrderNumber,
  getEmptyPosOrderState,
  getTableLabel,
} from './state';

describe('pos order state helpers', () => {
  it('formats order numbers with a fixed-width sequence', () => {
    expect(formatPosOrderNumber(INITIAL_ORDER_SEQUENCE)).toBe('#0001');
    expect(formatPosOrderNumber(40)).toBe('#0040');
  });

  it('builds menu quantities from order lines', () => {
    expect(
      createMenuQuantitiesFromLines([
        {
          id: 'l1',
          menuItemId: 'item-1',
          name: 'Item',
          price: 10,
          quantity: 2,
          imageUrl: '',
        },
      ]),
    ).toEqual({ 'item-1': 2 });
  });

  it('returns an empty cart for the next order', () => {
    expect(getEmptyPosOrderState()).toEqual({
      selectedTableId: '',
      selectedTableLabel: '',
      orderLines: [],
      menuQuantities: {},
    });
  });

  it('derives a readable table label from the selected table id', () => {
    expect(getTableLabel('t1', [{ id: 't1', label: 'T1' }])).toBe('Table 01');
  });
});
