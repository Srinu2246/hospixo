import { describe, expect, it } from 'vitest';

import { formatDineInRupee, getDineInTableStatusLabel } from '@/features/pos/config/dine-in';

describe('dine-in helpers', () => {
  it('formats rupee amounts', () => {
    expect(formatDineInRupee(480)).toBe('Rs 480');
    expect(formatDineInRupee(1250)).toBe('Rs 1,250');
  });

  it('returns readable table status labels', () => {
    expect(getDineInTableStatusLabel('available')).toBe('Available');
    expect(getDineInTableStatusLabel('occupied')).toBe('Occupied');
  });
});
