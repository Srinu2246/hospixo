import { describe, expect, it } from 'vitest';

import {
  applyCashMovement,
  buildLiveCloseShiftPreview,
  formatClockTime,
  formatClosedAtLabel,
  formatDateTimeLabel,
  formatInr,
  formatInrPlain,
  getActiveCashShift,
  getCashShiftDateFilter,
  getCashShiftMetrics,
  getCashTransactions,
  getCloseShiftPreview,
  getStartShiftDraft,
  maskEmail,
  nextShiftNumber,
  submitCloseShift,
} from '@/features/pos/cash-shift/lib';
import {
  cashShiftPreviewActive,
  cashShiftPreviewClose,
  cashShiftPreviewDate,
  cashShiftPreviewMetrics,
  cashShiftPreviewStart,
  cashShiftPreviewTransactions,
} from '@/features/pos/cash-shift/config/fixture';
import type { CashShiftMetrics, CashTransaction } from '@/features/pos/types/cash-shift';

const baseMetrics: CashShiftMetrics = {
  status: 'active',
  cashInDrawer: 1000,
  totalSales: 5000,
  transactions: 3,
};

const baseTransactions: CashTransaction[] = [
  {
    id: 'txn-1',
    timeLabel: '01:00 PM',
    type: 'cash_sale',
    description: 'Existing sale',
    amount: 100,
    balance: 1000,
  },
];

describe('formatInr', () => {
  it('prefixes positive amounts with +', () => {
    expect(formatInr(125.5)).toBe('+₹125.50');
  });

  it('prefixes negative amounts with -', () => {
    expect(formatInr(-45)).toBe('-₹45.00');
  });

  it('formats zero without a sign prefix', () => {
    expect(formatInr(0)).toBe('₹0.00');
  });
});

describe('formatInrPlain', () => {
  it('formats currency without a sign prefix', () => {
    expect(formatInrPlain(1245.5)).toBe('₹1,245.50');
  });
});

describe('formatClockTime', () => {
  it('formats a date in 12-hour en-US locale', () => {
    const date = new Date('2024-10-24T14:30:00');
    expect(formatClockTime(date)).toMatch(/02:30 PM/i);
  });
});

describe('formatClosedAtLabel', () => {
  it('combines a long-form date with clock time', () => {
    const date = new Date('2024-10-24T17:15:00');
    expect(formatClosedAtLabel(date)).toMatch(/October 24, 2024 at .+/i);
  });
});

describe('formatDateTimeLabel', () => {
  it('aliases formatClosedAtLabel for the start-shift form', () => {
    const date = new Date('2024-10-24T17:15:00');
    expect(formatDateTimeLabel(date)).toBe(formatClosedAtLabel(date));
  });
});

describe('maskEmail', () => {
  it('masks the local part and keeps the domain visible', () => {
    expect(maskEmail('manager@hotelmayukha.com')).toBe('m***@hotelmayukha.com');
  });

  it('returns the original value when the address is malformed', () => {
    expect(maskEmail('invalid')).toBe('invalid');
    expect(maskEmail('@domain.com')).toBe('@domain.com');
    expect(maskEmail('local@')).toBe('local@');
  });
});

describe('submitCloseShift', () => {
  it('resolves when required fields are present', async () => {
    await expect(
      submitCloseShift({
        shiftId: 'shift-1042',
        notes: '',
        actualCash: 1000,
        pin: '1234',
      }),
    ).resolves.toBeUndefined();
  });

  it('throws when shift id or pin is missing', async () => {
    await expect(
      submitCloseShift({
        shiftId: '',
        notes: '',
        actualCash: 1000,
        pin: '1234',
      }),
    ).rejects.toThrow('Missing required close-shift fields');
  });
});

describe('nextShiftNumber', () => {
  it('increments a numeric shift number', () => {
    expect(nextShiftNumber('1042')).toBe('1043');
  });

  it('appends a suffix when the previous shift number is not numeric', () => {
    expect(nextShiftNumber('SH-1042')).toBe('SH-1042-next');
  });
});

describe('cash shift preview loaders', () => {
  it('returns fixture metrics, active shift, date filter, transactions, and close preview', async () => {
    await expect(getCashShiftMetrics()).resolves.toEqual(cashShiftPreviewMetrics);
    await expect(getActiveCashShift()).resolves.toEqual(cashShiftPreviewActive);
    await expect(getCashShiftDateFilter()).resolves.toEqual(cashShiftPreviewDate);
    await expect(getCashTransactions()).resolves.toEqual(cashShiftPreviewTransactions);
    await expect(getCloseShiftPreview()).resolves.toEqual(cashShiftPreviewClose);
    await expect(getStartShiftDraft()).resolves.toEqual(cashShiftPreviewStart);
  });
});

describe('buildLiveCloseShiftPreview', () => {
  it('overlays live metrics and session cash movements onto the server preview', () => {
    const session = applyCashMovement({
      metrics: cashShiftPreviewMetrics,
      transactions: cashShiftPreviewTransactions,
      type: 'cash_in',
      amount: 50,
      description: 'Float top-up',
    });

    const preview = buildLiveCloseShiftPreview({
      closePreview: cashShiftPreviewClose,
      activeShift: cashShiftPreviewActive,
      metrics: session.metrics,
      initialMetrics: cashShiftPreviewMetrics,
      initialTransactions: cashShiftPreviewTransactions,
      transactions: session.transactions,
    });

    expect(preview.summary.totalSales).toBe(cashShiftPreviewMetrics.totalSales);
    expect(preview.summary.transactions).toBe(cashShiftPreviewMetrics.transactions + 1);
    expect(preview.reconciliation.expectedInDrawer).toBe(1295.5);
    expect(preview.reconciliation.totalCashIn).toBe(1795.5);
    expect(preview.payments.find((row) => row.id === 'cash')?.amount).toBe(1795.5);
  });

  it('includes session cash-out movements in reconciliation totals', () => {
    const session = applyCashMovement({
      metrics: cashShiftPreviewMetrics,
      transactions: cashShiftPreviewTransactions,
      type: 'cash_out',
      amount: 25,
      description: 'Petty cash',
    });

    const preview = buildLiveCloseShiftPreview({
      closePreview: cashShiftPreviewClose,
      activeShift: cashShiftPreviewActive,
      metrics: session.metrics,
      initialMetrics: cashShiftPreviewMetrics,
      initialTransactions: cashShiftPreviewTransactions,
      transactions: session.transactions,
    });

    expect(preview.reconciliation.totalCashOut).toBe(25);
    expect(preview.reconciliation.expectedInDrawer).toBe(1220.5);
  });
});

describe('applyCashMovement', () => {
  it('appends cash in, updates drawer balance, and increments transaction count', () => {
    const result = applyCashMovement({
      metrics: baseMetrics,
      transactions: baseTransactions,
      type: 'cash_in',
      amount: 50,
      description: 'Float top-up',
    });

    expect(result.metrics.cashInDrawer).toBe(1050);
    expect(result.metrics.transactions).toBe(4);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0]).toMatchObject({
      type: 'cash_in',
      amount: 50,
      balance: 1050,
      description: 'Float top-up',
    });
  });

  it('treats cash out as a negative movement and recomputes balance', () => {
    const result = applyCashMovement({
      metrics: baseMetrics,
      transactions: baseTransactions,
      type: 'cash_out',
      amount: 75,
      description: 'Petty cash',
    });

    expect(result.metrics.cashInDrawer).toBe(925);
    expect(result.transactions[0]).toMatchObject({
      type: 'cash_out',
      amount: -75,
      balance: 925,
    });
  });

  it('uses absolute value when a negative amount is passed for cash in', () => {
    const result = applyCashMovement({
      metrics: baseMetrics,
      transactions: baseTransactions,
      type: 'cash_in',
      amount: -40,
      description: 'Correction',
    });

    expect(result.transactions[0].amount).toBe(40);
    expect(result.metrics.cashInDrawer).toBe(1040);
  });

  it('rounds drawer balance to two decimal places', () => {
    const result = applyCashMovement({
      metrics: { ...baseMetrics, cashInDrawer: 1000.005 },
      transactions: baseTransactions,
      type: 'cash_in',
      amount: 0.004,
      description: 'Rounding check',
    });

    expect(result.metrics.cashInDrawer).toBe(1000.01);
  });
});
