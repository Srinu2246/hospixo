'use client';

import {
  paymentSuccessLines,
  paymentSuccessOrderMeta,
  paymentSuccessPageMeta,
  paymentSuccessTotals,
} from '@/features/pos/config/payment-success';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';

export function usePaymentSuccessPage() {
  const flowPaths = usePosFlowPaths();
  const itemCount = paymentSuccessLines.reduce((sum, line) => sum + line.quantity, 0);

  return {
    itemCount,
    lines: paymentSuccessLines,
    totals: paymentSuccessTotals,
    meta: paymentSuccessOrderMeta,
    pageMeta: paymentSuccessPageMeta,
    dineInHref: flowPaths.dineIn,
  };
}

export type PaymentSuccessPageViewModel = ReturnType<typeof usePaymentSuccessPage>;
