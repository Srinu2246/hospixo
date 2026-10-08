'use client';

import { useRouter } from 'next/navigation';
import { useMemo, type ElementType } from 'react';
import {
  buildCheckoutFeeLines,
  checkoutPageMeta,
  checkoutPaymentMethods,
  computeCheckoutTotal,
  dineInLinesToCheckout,
  formatCheckoutRupee,
  type CheckoutFeeLine,
  type CheckoutPaymentMethodId,
} from '@/features/pos/config/checkout';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';
import { usePosOrder } from '@/context/pos-order';
import { CreditCard, IndianRupee, Landmark, QrCode } from 'lucide-react';

import { CheckoutFeeList } from './checkout-fee-list';
import { CheckoutReceiptCard } from './checkout-receipt-card';
import styles from './payment-method-panel.module.css';

type StandardPaymentMethodId = Exclude<CheckoutPaymentMethodId, 'partPayment'>;

const methodIcons: Record<StandardPaymentMethodId, ElementType> = {
  cash: IndianRupee,
  card: CreditCard,
  upi: QrCode,
  sodexo: Landmark,
};

function renderMethodIcon(methodId: CheckoutPaymentMethodId, Icon: ElementType | null) {
  if (methodId === 'partPayment') {
    return <PartPaymentIcon />;
  }
  if (Icon) {
    return <Icon size={16} strokeWidth={2} aria-hidden />;
  }
  return null;
}

function PartPaymentIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className={styles.methodIconSvg}
    >
      <path
        d="M1.5 7.50043H16.5012M3.00012 3.75H15.0011C15.8296 3.75 16.5012 4.42165 16.5012 5.25017V12.751C16.5012 13.5795 15.8296 14.2512 15.0011 14.2512H3.00012C2.17163 14.2512 1.5 13.5795 1.5 12.751V5.25017C1.5 4.42165 2.17163 3.75 3.00012 3.75Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

interface PaymentMethodPanelProps {
  selectedMethod: CheckoutPaymentMethodId;
  onSelectMethod: (method: CheckoutPaymentMethodId) => void;
  feeLines?: CheckoutFeeLine[];
  total?: number;
  onConfirm?: () => void;
  layout?: 'panel' | 'compact';
}

export function PaymentMethodPanel({
  selectedMethod,
  onSelectMethod,
  feeLines: feeLinesProp,
  total: totalProp,
  onConfirm,
  layout = 'panel',
}: Readonly<PaymentMethodPanelProps>) {
  const router = useRouter();
  const flowPaths = usePosFlowPaths();
  const { orderLines, completeOrder } = usePosOrder();

  const computed = useMemo(() => {
    const lines = dineInLinesToCheckout(orderLines);
    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const feeLines = buildCheckoutFeeLines(subtotal);
    return {
      feeLines,
      total: computeCheckoutTotal(feeLines),
    };
  }, [orderLines]);

  const feeLines = feeLinesProp ?? computed.feeLines;
  const total = totalProp ?? computed.total;
  const isCompact = layout === 'compact';

  function handleConfirm() {
    if (onConfirm) {
      onConfirm();
      return;
    }
    completeOrder();
    router.push(flowPaths.paymentSuccess);
  }

  const confirmLabel = `${checkoutPageMeta.confirmLabel} • ${formatCheckoutRupee(total)}`;

  const paymentBody = (
    <>
      <h2 id="payment-method-heading" className={styles.title}>
        {checkoutPageMeta.paymentTitle}
      </h2>

      <ul className={styles.methodList}>
        {checkoutPaymentMethods.map((method) => {
          const selected = method.id === selectedMethod;
          const Icon = method.id !== 'partPayment' ? methodIcons[method.id] : null;
          return (
            <li key={method.id}>
              <button
                type="button"
                className={`${styles.methodBtn} ${selected ? styles.methodBtnActive : ''}`}
                aria-pressed={selected}
                onClick={() => onSelectMethod(method.id)}
              >
                <span className={styles.methodLeft}>
                  <span className={styles.methodIcon}>{renderMethodIcon(method.id, Icon)}</span>
                  {method.label}
                </span>
                <span className={`${styles.radio} ${selected ? styles.radioChecked : ''}`} />
              </button>
            </li>
          );
        })}
      </ul>

      <CheckoutFeeList
        feeLines={feeLines}
        total={total}
        variant="inline"
        bordered
        dividerStyle="dashed"
        grandTotalLabel="Grand Total"
      />

      <button type="button" className={styles.confirmBtn} onClick={handleConfirm}>
        {confirmLabel}
      </button>

      {!isCompact ? (
        <>
          <p className={styles.secured}>{checkoutPageMeta.securedCaption}</p>
          <CheckoutReceiptCard variant="embedded" />
        </>
      ) : null}
    </>
  );

  if (isCompact) {
    return (
      <div className={styles.compactStack}>
        <section className={styles.paymentCard} aria-labelledby="payment-method-heading">
          {paymentBody}
        </section>
        <CheckoutReceiptCard variant="card" />
      </div>
    );
  }

  return (
    <section className={styles.panel} aria-labelledby="payment-method-heading">
      {paymentBody}
    </section>
  );
}
