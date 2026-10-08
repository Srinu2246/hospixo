'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { DineInOrderLine } from '@/features/pos/config/dine-in';
import {
  buildCheckoutFeeLines,
  computeCheckoutTotal,
  dineInLinesToCheckout,
  type CheckoutPaymentMethodId,
} from '@/features/pos/config/checkout';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';
import { usePosOrder } from '@/context/pos-order';

export function formatCheckoutLineDetail(line: DineInOrderLine) {
  return [line.variant, ...(line.addOns ?? []), line.cookingPreference].filter(Boolean).join(', ');
}

export function useCheckoutPage() {
  const router = useRouter();
  const flowPaths = usePosFlowPaths();
  const { orderLines, tableLabel, orderNumber, completeOrder } = usePosOrder();
  const [selectedMethod, setSelectedMethod] = useState<CheckoutPaymentMethodId>('cash');

  const lines = useMemo(() => {
    const checkoutLines = dineInLinesToCheckout(orderLines);
    return checkoutLines.map((checkoutLine, index) => ({
      ...checkoutLine,
      detail: formatCheckoutLineDetail(orderLines[index]!),
    }));
  }, [orderLines]);
  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [lines],
  );
  const feeLines = useMemo(() => buildCheckoutFeeLines(subtotal), [subtotal]);
  const total = useMemo(() => computeCheckoutTotal(feeLines), [feeLines]);

  function handleConfirm() {
    completeOrder();
    router.push(flowPaths.paymentSuccess);
  }

  return {
    selectedMethod,
    setSelectedMethod,
    lines,
    feeLines,
    total,
    subtotal,
    tableLabel,
    orderNumber,
    handleConfirm,
  };
}

export type CheckoutPageViewModel = ReturnType<typeof useCheckoutPage>;
