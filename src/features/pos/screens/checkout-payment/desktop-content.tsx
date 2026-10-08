'use client';

import { checkoutPageMeta } from '@/features/pos/config/checkout';
import { PosFlowShell } from '@/features/pos/screens/layout/pos-flow-shell';
import { PosFlowTopbar } from '@/features/pos/screens/shared/pos-flow-topbar';
import { PaymentMethodPanel } from '@/features/pos/screens/checkout-payment/payment-method-panel';

import type { CheckoutPageViewModel } from './use-checkout-page';
import styles from './checkout-payment-page.module.css';

export function CheckoutDesktopContent({
  feeLines,
  total,
  selectedMethod,
  setSelectedMethod,
  handleConfirm,
}: Readonly<CheckoutPageViewModel>) {
  return (
    <PosFlowShell activeNavId="checkout-payment" fullWidth>
      <div className={styles.page}>
        <PosFlowTopbar statusLabel={checkoutPageMeta.statusBadge} fullWidth />

        <div className={styles.layout}>
          <PaymentMethodPanel
            layout="compact"
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            feeLines={feeLines}
            total={total}
            onConfirm={handleConfirm}
          />
        </div>
      </div>
    </PosFlowShell>
  );
}
