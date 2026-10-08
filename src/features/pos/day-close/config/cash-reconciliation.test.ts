import { describe, expect, it } from 'vitest';

import {
  buildInitialDenominationQuantities,
  cashReconciliationDenominations,
  formatCashReconciliationAmount,
  formatCashReconciliationSummaryAmount,
  getCalculatedDrawerTotal,
  getDenominationSubtotal,
  getReconciliationVariance,
  isReconciliationBalanced,
} from '@/features/pos/day-close/config/cash-reconciliation';

describe('cash reconciliation helpers', () => {
  it('formats drawer amounts', () => {
    expect(formatCashReconciliationAmount(15450)).toBe('Rs 15,450.00');
    expect(formatCashReconciliationAmount(500, { decimals: false })).toBe('Rs 500');
  });

  it('formats summary amounts', () => {
    expect(formatCashReconciliationSummaryAmount(84290)).toBe('₹84,290.00');
  });

  it('calculates denomination subtotals and drawer totals', () => {
    const quantities = buildInitialDenominationQuantities(cashReconciliationDenominations);
    expect(getDenominationSubtotal(500, 2)).toBe(1000);
    expect(getCalculatedDrawerTotal(cashReconciliationDenominations, quantities)).toBeGreaterThan(
      0,
    );
  });

  it('detects balanced and mismatched variance', () => {
    expect(getReconciliationVariance(1000, 1000)).toBe(0);
    expect(isReconciliationBalanced(0)).toBe(true);
    expect(isReconciliationBalanced(50)).toBe(false);
  });
});
