'use client';

import { useState } from 'react';

import type { DuePayment } from '@/features/pos/config/due-payments';
import {
  useDuePaymentsQuery,
  useSettleDuePaymentMutation,
} from '@/features/pos/hooks/use-due-payments';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';

export interface DuePaymentsPageViewModel {
  settleFromPos: boolean;
  setSettleFromPos: (value: boolean) => void;
  payments: DuePayment[];
  handleSettle: (paymentId: string) => void;
  isLoading: boolean;
  isError: boolean;
  loadError: string | null;
}

export function useDuePaymentsPage(): DuePaymentsPageViewModel {
  const [settleFromPos, setSettleFromPos] = useState(true);
  const outletId = useFloorBranchOutletId();
  const { data, isPending, isError, error } = useDuePaymentsQuery();
  const settleMutation = useSettleDuePaymentMutation(outletId);

  const payments = data?.payments ?? [];

  function handleSettle(paymentId: string) {
    if (!settleFromPos) return;
    settleMutation.mutate(paymentId);
  }

  return {
    settleFromPos,
    setSettleFromPos,
    payments,
    handleSettle,
    isLoading: isPending || settleMutation.isPending,
    isError,
    loadError: error instanceof Error ? error.message : (data?.loadError ?? null),
  };
}
