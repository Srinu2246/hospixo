import {
  cashShiftPreviewActive,
  cashShiftPreviewClose,
  cashShiftPreviewDate,
  cashShiftPreviewMetrics,
  cashShiftPreviewStart,
  cashShiftPreviewTransactions,
} from '@/features/pos/cash-shift/config';
import type {
  ActiveCashShift,
  CashShiftDateFilter,
  CashShiftMetrics,
  CashTransaction,
  CloseShiftPreview,
  CloseShiftSubmitPayload,
  StartShiftDraft,
} from '@/features/pos/types/cash-shift';

export async function getCashShiftMetrics(): Promise<CashShiftMetrics> {
  return cashShiftPreviewMetrics;
}

export async function getActiveCashShift(): Promise<ActiveCashShift> {
  return cashShiftPreviewActive;
}

export async function getCashShiftDateFilter(): Promise<CashShiftDateFilter> {
  return cashShiftPreviewDate;
}

export async function getCashTransactions(): Promise<CashTransaction[]> {
  return cashShiftPreviewTransactions;
}

export async function getCloseShiftPreview(): Promise<CloseShiftPreview> {
  return cashShiftPreviewClose;
}

export async function getStartShiftDraft(): Promise<StartShiftDraft> {
  return cashShiftPreviewStart;
}

export function formatInr(amount: number): string {
  const absolute = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(absolute);

  if (amount < 0) return `-${formatted}`;
  if (amount > 0) return `+${formatted}`;
  return formatted;
}

export function formatInrPlain(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatClockTime(date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatClosedAtLabel(date = new Date()): string {
  const day = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return `${day} at ${formatClockTime(date)}`;
}

/** Alias used by the start-shift form datetime display. */
export function formatDateTimeLabel(date = new Date()): string {
  return formatClosedAtLabel(date);
}

export function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return email;

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  if (!domain) return email;

  return `${local.slice(0, 1)}***@${domain}`;
}

/** Increment numeric shift numbers; non-numeric backend values get a safe suffix. */
export function nextShiftNumber(previousNumber: string): string {
  const parsed = Number.parseInt(previousNumber, 10);
  if (Number.isFinite(parsed)) return String(parsed + 1);
  return `${previousNumber}-next`;
}

function sessionCashMovementDelta(
  initialTransactions: readonly CashTransaction[],
  transactions: readonly CashTransaction[],
) {
  const initialIds = new Set(initialTransactions.map((txn) => txn.id));
  const sessionTxns = transactions.filter((txn) => !initialIds.has(txn.id));

  const cashIn = sessionTxns
    .filter((txn) => txn.type === 'cash_in')
    .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
  const cashOut = sessionTxns
    .filter((txn) => txn.type === 'cash_out')
    .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

  return {
    cashIn,
    cashOut,
    cashInCount: sessionTxns.filter((txn) => txn.type === 'cash_in').length,
    cashOutCount: sessionTxns.filter((txn) => txn.type === 'cash_out').length,
  };
}

/** Merge server close preview with live shift metrics and session cash movements. */
export function buildLiveCloseShiftPreview(params: {
  closePreview: CloseShiftPreview;
  activeShift: ActiveCashShift;
  metrics: CashShiftMetrics;
  initialMetrics: CashShiftMetrics;
  initialTransactions: readonly CashTransaction[];
  transactions: readonly CashTransaction[];
}): CloseShiftPreview {
  const { closePreview, activeShift, metrics, initialMetrics, initialTransactions, transactions } =
    params;

  const sessionDelta = sessionCashMovementDelta(initialTransactions, transactions);
  const drawerDelta = Number((metrics.cashInDrawer - initialMetrics.cashInDrawer).toFixed(2));

  return {
    ...closePreview,
    summary: {
      ...closePreview.summary,
      shiftId: `#${activeShift.number}`,
      openedBy: activeShift.openedBy,
      startTimeLabel: activeShift.startTimeLabel,
      totalSales: metrics.totalSales,
      transactions: metrics.transactions,
    },
    payments: closePreview.payments.map((row) => {
      if (row.id !== 'cash') return row;

      return {
        ...row,
        amount: Number((row.amount + drawerDelta).toFixed(2)),
        transactions: row.transactions + sessionDelta.cashInCount + sessionDelta.cashOutCount,
      };
    }),
    reconciliation: {
      openingBalance: activeShift.openingBalance,
      totalCashIn: Number(
        (closePreview.reconciliation.totalCashIn + sessionDelta.cashIn).toFixed(2),
      ),
      totalCashOut: Number(
        (closePreview.reconciliation.totalCashOut + sessionDelta.cashOut).toFixed(2),
      ),
      expectedInDrawer: metrics.cashInDrawer,
    },
  };
}

/**
 * Client stub — validates required fields only.
 * Swap for `POST /api/v1/cash-shift/close` before treating close as production-ready.
 */
export async function submitCloseShift(payload: CloseShiftSubmitPayload): Promise<void> {
  if (!payload.shiftId.trim() || !payload.pin.trim()) {
    throw new Error('Missing required close-shift fields');
  }
}

/** Append a cash in/out row and recompute drawer + transaction count. */
export function applyCashMovement(params: {
  metrics: CashShiftMetrics;
  transactions: readonly CashTransaction[];
  type: 'cash_in' | 'cash_out';
  amount: number;
  description: string;
}): { metrics: CashShiftMetrics; transactions: CashTransaction[] } {
  const signed = params.type === 'cash_out' ? -Math.abs(params.amount) : Math.abs(params.amount);
  const nextBalance = Number((params.metrics.cashInDrawer + signed).toFixed(2));

  const nextTxn: CashTransaction = {
    id: `txn-${Date.now()}`,
    timeLabel: formatClockTime(),
    type: params.type,
    description: params.description,
    amount: signed,
    balance: nextBalance,
  };

  return {
    metrics: {
      ...params.metrics,
      cashInDrawer: nextBalance,
      transactions: params.metrics.transactions + 1,
    },
    transactions: [nextTxn, ...params.transactions],
  };
}
