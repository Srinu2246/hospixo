'use client';

import {
  PosCompactBody,
  PosCompactHeader,
  PosCompactPage,
} from '@/features/pos/screens/layout/pos-compact-page';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';
import { PaymentMethodPanel } from '@/features/pos/screens/checkout-payment/payment-method-panel';

import type { CheckoutPageViewModel } from './use-checkout-page';
import styles from './compact-checkout-content.module.css';

interface CompactCheckoutContentProps extends CheckoutPageViewModel {
  layout: 'mobile' | 'tablet';
}

export function CompactCheckoutContent({
  layout,
  feeLines,
  total,
  tableLabel,
  orderNumber,
  selectedMethod,
  setSelectedMethod,
  handleConfirm,
}: Readonly<CompactCheckoutContentProps>) {
  const subtitle = `Order ${orderNumber} - ${tableLabel}`;

  return (
    <PosMobileShell activeNavId="orders" withPageBg>
      <PosCompactPage>
        <PosCompactHeader>
          <PosMobileHeader title="Checkout Payment" subtitle={subtitle} />
        </PosCompactHeader>
        <PosCompactBody
          className={`${styles.body} ${layout === 'tablet' ? styles.tabletLayout : ''}`}
        >
          <PaymentMethodPanel
            layout="compact"
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            feeLines={feeLines}
            total={total}
            onConfirm={handleConfirm}
          />
        </PosCompactBody>
      </PosCompactPage>
    </PosMobileShell>
  );
}
