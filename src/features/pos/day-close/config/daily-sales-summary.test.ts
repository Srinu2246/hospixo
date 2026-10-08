import { describe, expect, it } from 'vitest';

import {
  formatDailySalesAmount,
  formatDailySalesRevenue,
} from '@/features/pos/day-close/config/daily-sales-summary';

describe('daily sales summary helpers', () => {
  it('formats summary amounts', () => {
    expect(formatDailySalesAmount(84290)).toBe('₹84,290');
    expect(formatDailySalesRevenue(12480)).toBe('₹12,480');
  });
});
