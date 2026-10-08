'use client';

import { useState } from 'react';

import { ActiveShiftBanner } from '@/features/pos/cash-shift/components/active-shift';
import { CloseShift } from '@/features/pos/cash-shift/components/close-shift';
import { CashShiftFooter } from '@/features/pos/cash-shift/components/footer';
import { CashShiftHeader } from '@/features/pos/cash-shift/components/header';
import { TransactionHistory } from '@/features/pos/cash-shift/components/history';
import { CashShiftMetricsCards } from '@/features/pos/cash-shift/components/metrics';
import {
  CashShiftPreviewDialog,
  type CashShiftPreviewDialogState,
} from '@/features/pos/cash-shift/components/preview-dialog';
import { ShiftClosed } from '@/features/pos/cash-shift/components/shift-closed';
import { StartShift } from '@/features/pos/cash-shift/components/start-shift';
import { cashShiftCopy } from '@/features/pos/cash-shift/config';
import { getApiErrorMessage } from '@/lib/api/errors';
import {
  applyCashMovement,
  buildLiveCloseShiftPreview,
  formatClosedAtLabel,
  formatClockTime,
  maskEmail,
  nextShiftNumber,
  submitCloseShift,
} from '@/features/pos/cash-shift/lib';
import type {
  ActiveCashShift,
  CashShiftDateFilter,
  CashShiftMetrics,
  CashTransaction,
  CloseShiftPreview,
  ShiftClosedResult,
  StartShiftDraft,
  StartShiftPayload,
} from '@/features/pos/types/cash-shift';

import styles from './cash-shift.module.css';

type CashShiftProps = Readonly<{
  metrics: CashShiftMetrics;
  activeShift: ActiveCashShift;
  transactions: readonly CashTransaction[];
  dateFilter: CashShiftDateFilter;
  closePreview: CloseShiftPreview;
  startDraft: StartShiftDraft;
  /** Compact layout under PosMobileHeader (mobile/tablet). */
  compact?: boolean;
}>;

type View = 'main' | 'closing' | 'closed' | 'starting';

type SessionBaseline = Readonly<{
  metrics: CashShiftMetrics;
  transactions: CashTransaction[];
}>;

function initialViewForMetrics(status: CashShiftMetrics['status']): View {
  return status === 'closed' ? 'starting' : 'main';
}

export function CashShift({
  metrics: initialMetrics,
  activeShift: initialActiveShift,
  transactions: initialTransactions,
  dateFilter,
  closePreview,
  startDraft,
  compact = false,
}: CashShiftProps) {
  const [activeShift, setActiveShift] = useState(initialActiveShift);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [transactions, setTransactions] = useState(() => [...initialTransactions]);
  const [sessionBaseline, setSessionBaseline] = useState<SessionBaseline>(() => ({
    metrics: initialMetrics,
    transactions: [...initialTransactions],
  }));
  const [view, setView] = useState<View>(() => initialViewForMetrics(initialMetrics.status));
  const [isClosingSubmit, setIsClosingSubmit] = useState(false);
  const [reportPrinted, setReportPrinted] = useState(false);
  const [closedResult, setClosedResult] = useState<ShiftClosedResult | null>(null);
  const [nextStartDraft, setNextStartDraft] = useState(startDraft);
  const [dialog, setDialog] = useState<CashShiftPreviewDialogState>({ kind: 'closed' });

  function closeDialog() {
    setDialog({ kind: 'closed' });
  }

  function liveClosePreview() {
    return buildLiveCloseShiftPreview({
      closePreview,
      activeShift,
      metrics,
      initialMetrics: sessionBaseline.metrics,
      initialTransactions: sessionBaseline.transactions,
      transactions,
    });
  }

  function handleCashIn() {
    setDialog({
      kind: 'amount',
      variant: 'cash_in',
      title: cashShiftCopy.prompts.cashInAmount,
      onSubmit: (amount) => {
        const next = applyCashMovement({
          metrics,
          transactions,
          type: 'cash_in',
          amount,
          description: cashShiftCopy.prompts.cashInDescription,
        });
        setMetrics(next.metrics);
        setTransactions(next.transactions);
      },
    });
  }

  function handleCashOut() {
    setDialog({
      kind: 'amount',
      variant: 'cash_out',
      title: cashShiftCopy.prompts.cashOutAmount,
      onSubmit: (amount) => {
        const next = applyCashMovement({
          metrics,
          transactions,
          type: 'cash_out',
          amount,
          description: cashShiftCopy.prompts.cashOutDescription,
        });
        setMetrics(next.metrics);
        setTransactions(next.transactions);
      },
    });
  }

  function handleCloseShiftClick() {
    setDialog({
      kind: 'confirm',
      message: cashShiftCopy.preview.closeShiftConfirm,
      onConfirm: () => {
        setReportPrinted(false);
        setView('closing');
        closeDialog();
      },
    });
  }

  async function handleConfirmClose(payload: { notes: string; actualCash: number; pin: string }) {
    if (isClosingSubmit) return;

    setIsClosingSubmit(true);
    try {
      await submitCloseShift({
        shiftId: activeShift.id,
        notes: payload.notes,
        actualCash: payload.actualCash,
        pin: payload.pin,
      });

      const preview = liveClosePreview();
      const endTimeLabel = formatClockTime();
      const cashDifference = Number(
        (payload.actualCash - preview.reconciliation.expectedInDrawer).toFixed(2),
      );
      const balanced = Math.abs(cashDifference) < 0.005;

      setMetrics((prev) => ({ ...prev, status: 'closed' }));
      setClosedResult({
        shiftNumber: activeShift.number,
        openedBy: activeShift.openedBy,
        startTimeLabel: activeShift.startTimeLabel,
        endTimeLabel,
        closedAtLabel: formatClosedAtLabel(),
        durationLabel: preview.summary.durationLabel,
        totalSales: metrics.totalSales,
        transactions: metrics.transactions,
        cashDifference,
        balanceStatus: balanced ? 'balanced' : 'variance',
        reportPrinted,
        managerEmailMasked: maskEmail(activeShift.managerEmail),
      });
      setNextStartDraft((prev) => ({
        ...prev,
        nextShiftNumber: nextShiftNumber(activeShift.number),
        defaultOpeningBalance: 0,
      }));
      closeDialog();
      setView('closed');
    } catch (error) {
      setDialog({
        kind: 'info',
        message: getApiErrorMessage(error, cashShiftCopy.close.submitFailed),
      });
    } finally {
      setIsClosingSubmit(false);
    }
  }

  function handlePrintShiftSummary() {
    window.print();
    setReportPrinted(true);
  }

  function handleOpenStartForm() {
    setView('starting');
  }

  function handleStartShift(payload: StartShiftPayload) {
    const startTimeLabel = formatClockTime();
    const nextShift: ActiveCashShift = {
      id: `shift-${payload.shiftNumber}`,
      number: payload.shiftNumber,
      openedBy: payload.operatorName,
      startTimeLabel,
      openingBalance: payload.openingBalance,
      managerEmail: activeShift.managerEmail,
    };
    const nextMetrics: CashShiftMetrics = {
      status: 'active',
      cashInDrawer: payload.openingBalance,
      totalSales: 0,
      transactions: 0,
    };

    setActiveShift(nextShift);
    setMetrics(nextMetrics);
    setTransactions([]);
    setSessionBaseline({ metrics: nextMetrics, transactions: [] });
    setClosedResult(null);
    setReportPrinted(false);
    setNextStartDraft((prev) => ({
      ...prev,
      nextShiftNumber: nextShiftNumber(payload.shiftNumber),
      defaultOperatorId: payload.operatorId,
      defaultTerminalId: payload.terminalId,
      defaultOpeningBalance: 0,
    }));
    setView('main');
  }

  const dialogElement = <CashShiftPreviewDialog state={dialog} onClose={closeDialog} />;

  if (view === 'starting') {
    const canCancelStart = closedResult !== null;

    return (
      <>
        <StartShift
          draft={nextStartDraft}
          canCancel={canCancelStart}
          onCancel={() => setView('closed')}
          onStart={handleStartShift}
        />
        {dialogElement}
      </>
    );
  }

  if (view === 'closed' && closedResult) {
    return (
      <>
        <ShiftClosed result={closedResult} onStartNewShift={handleOpenStartForm} />
        {dialogElement}
      </>
    );
  }

  if (view === 'closing') {
    return (
      <>
        <CloseShift
          preview={liveClosePreview()}
          shiftNumber={activeShift.number}
          onBack={() => setView('main')}
          onConfirm={handleConfirmClose}
          onPrint={handlePrintShiftSummary}
          isSubmitting={isClosingSubmit}
        />
        {dialogElement}
      </>
    );
  }

  return (
    <>
      <div className={`${styles.page} ${compact ? styles.pageCompact : ''}`}>
        <CashShiftHeader onCashIn={handleCashIn} onCashOut={handleCashOut} hideTitle={compact} />
        <CashShiftMetricsCards metrics={metrics} />
        <ActiveShiftBanner shift={activeShift} />
        <TransactionHistory
          transactions={transactions}
          dateFilter={dateFilter}
          onViewAll={() => setDialog({ kind: 'info', message: cashShiftCopy.preview.viewAll })}
        />
        <CashShiftFooter
          onCloseShift={handleCloseShiftClick}
          shiftIsActive={metrics.status === 'active'}
        />
      </div>
      {dialogElement}
    </>
  );
}
