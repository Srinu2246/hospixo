import { describe, expect, it } from 'vitest';

import { getCompactTableStatus } from '@/features/pos/lib/pos-table-status';

describe('getCompactTableStatus', () => {
  it('uses real table status labels instead of collapsing to Reserved', () => {
    expect(getCompactTableStatus('available')).toEqual({
      label: 'Available',
      tone: 'available',
    });
    expect(getCompactTableStatus('billing')).toEqual({
      label: 'Billing',
      tone: 'occupied',
    });
    expect(getCompactTableStatus('cleaning')).toEqual({
      label: 'cleaning',
      tone: 'available',
    });
    expect(getCompactTableStatus('kotSent')).toEqual({
      label: 'KOT Sent',
      tone: 'occupied',
    });
  });
});
