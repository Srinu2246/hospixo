import { describe, expect, it } from 'vitest';

import { formatDineInInr, formatDineInRupee } from '@/features/pos/lib/pos-currency';

describe('pos-currency', () => {
  it('formats rupee and INR amounts for dine-in totals', () => {
    expect(formatDineInRupee(1250)).toBe('Rs 1,250');
    expect(formatDineInInr(1250)).toBe('₹1,250');
  });
});
