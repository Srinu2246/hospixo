import { describe, expect, it } from 'vitest';

import { formatDuePaymentAmount } from '@/features/pos/config/due-payments';

describe('due payments helpers', () => {
  it('formats USD amounts with two decimal places', () => {
    expect(formatDuePaymentAmount(240)).toBe('$240.00');
    expect(formatDuePaymentAmount(85.5)).toBe('$85.50');
  });
});
