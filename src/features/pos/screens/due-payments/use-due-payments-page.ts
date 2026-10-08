'use client';

import { useState } from 'react';

import {
  duePayments as initialDuePayments,
  type DuePayment,
} from '@/features/pos/config/due-payments';

export interface DuePaymentsPageViewModel {
  settleFromPos: boolean;
  setSettleFromPos: (value: boolean) => void;
  payments: DuePayment[];
  handleSettle: (paymentId: string) => void;
}

export function useDuePaymentsPage(): DuePaymentsPageViewModel {
  const [settleFromPos, setSettleFromPos] = useState(true);
  const [payments, setPayments] = useState<DuePayment[]>(initialDuePayments);

  function handleSettle(paymentId: string) {
    setPayments((current) =>
      current.map((payment) =>
        payment.id === paymentId ? { ...payment, status: 'paid' } : payment,
      ),
    );
  }

  return {
    settleFromPos,
    setSettleFromPos,
    payments,
    handleSettle,
  };
}
