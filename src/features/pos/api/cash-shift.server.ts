import 'server-only';

import {
  getActiveCashShift,
  getCashShiftDateFilter,
  getCashShiftMetrics,
  getCashTransactions,
  getCloseShiftPreview,
  getStartShiftDraft,
} from '@/features/pos/cash-shift/lib';
import type {
  ActiveCashShift,
  CashShiftDateFilter,
  CashShiftMetrics,
  CashTransaction,
  CloseShiftPreview,
  StartShiftDraft,
} from '@/features/pos/types/cash-shift';

export type PosCashShiftPayload = Readonly<{
  metrics: CashShiftMetrics;
  activeShift: ActiveCashShift;
  transactions: readonly CashTransaction[];
  dateFilter: CashShiftDateFilter;
  closePreview: CloseShiftPreview;
  startDraft: StartShiftDraft;
  source: 'preview';
}>;

/** Server loader — swap internals for backend cash-shift API when available. */
export async function loadPosCashShiftData(): Promise<PosCashShiftPayload> {
  const [metrics, activeShift, transactions, dateFilter, closePreview, startDraft] =
    await Promise.all([
      getCashShiftMetrics(),
      getActiveCashShift(),
      getCashTransactions(),
      getCashShiftDateFilter(),
      getCloseShiftPreview(),
      getStartShiftDraft(),
    ]);

  return {
    metrics,
    activeShift,
    transactions,
    dateFilter,
    closePreview,
    startDraft,
    source: 'preview',
  };
}
