import { describe, expect, it } from 'vitest';

import { formatRupee, getTableStatusLabel } from '@/features/pos/config/tables';

describe('tables helpers', () => {
  it('formats rupee amounts', () => {
    expect(formatRupee(1340)).toBe('Rs.1,340');
  });

  it('returns readable status labels', () => {
    expect(getTableStatusLabel('kotSent')).toBe('KOT Sent');
    expect(getTableStatusLabel('cleaning')).toBe('cleaning');
  });
});
