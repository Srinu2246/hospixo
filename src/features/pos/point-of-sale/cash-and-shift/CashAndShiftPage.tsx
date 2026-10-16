'use client';

import React, { useState } from 'react';
import { CashAndShiftDashboardPage } from './CashAndShiftDashboardPage';
import { CreateNewShiftPage } from './CreateNewShiftPage';

export interface CashAndShiftPageProps {
  initialHasActiveShift?: boolean;
}

/**
 * CashAndShiftPage Component
 *
 * Primary entry point for the POS Cash & Shift module:
 * - If no active shift exists / persists, renders `CreateNewShiftPage` to start a shift.
 * - If an active shift persists, renders `CashAndShiftDashboardPage` with live shift metrics and transactions.
 */
export function CashAndShiftPage({
  initialHasActiveShift = true,
}: Readonly<CashAndShiftPageProps>) {
  const [hasActiveShift, setHasActiveShift] = useState(initialHasActiveShift);

  if (!hasActiveShift) {
    return <CreateNewShiftPage onStartShift={() => setHasActiveShift(true)} />;
  }

  return <CashAndShiftDashboardPage />;
}
