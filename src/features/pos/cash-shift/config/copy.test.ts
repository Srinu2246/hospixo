import { describe, expect, it } from 'vitest';

import { cashShiftCopy } from '@/features/pos/cash-shift/config/copy';

describe('cashShiftCopy', () => {
  it('exposes stable labels for shift actions and transaction types', () => {
    expect(cashShiftCopy.actions.cashIn).toBe('+ Add Cash In');
    expect(cashShiftCopy.txnType.refund).toBe('Refund');
    expect(cashShiftCopy.preview.viewAll).toMatch(/coming soon/i);
  });

  it('exposes start-shift and dialog labels used by the new shift flow', () => {
    expect(cashShiftCopy.start.title).toBe('Start New Shift');
    expect(cashShiftCopy.start.confirm).toBe('Start Shift');
    expect(cashShiftCopy.dialogs.cashInSubmit).toBe('Add Cash In');
    expect(cashShiftCopy.dialogs.cashOutSubmit).toBe('Remove Cash');
    expect(cashShiftCopy.closed.title('1042')).toBe('Shift #1042 Closed Successfully');
  });
});
