'use client';

import Link from 'next/link';
import { paymentSuccessPageMeta } from '@/features/pos/config/payment-success';
import { PosFlowShell } from '@/features/pos/screens/layout/pos-flow-shell';
import { ReceiptCard } from '@/features/pos/screens/payment-success/receipt-card';
import { CheckCircle2, Plus, Printer } from 'lucide-react';

import type { PaymentSuccessPageViewModel } from './use-payment-success-page';
import styles from './payment-success-page.module.css';

export function PaymentSuccessDesktopContent({
  meta,
  dineInHref,
}: Readonly<PaymentSuccessPageViewModel>) {
  return (
    <PosFlowShell activeNavId="checkout-payment">
      <div className={styles.page}>
        <div className={styles.body}>
          <section className={styles.hero} aria-labelledby="payment-success-heading">
            <div className={styles.successIconWrap}>
              <CheckCircle2 className={styles.successIcon} size={36} aria-hidden />
            </div>
            <h1 id="payment-success-heading" className={styles.title}>
              {paymentSuccessPageMeta.title}
            </h1>
            <p className={styles.subtitle}>{meta.headline}</p>
          </section>

          <ReceiptCard />

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn}>
              <Printer size={18} aria-hidden />
              {paymentSuccessPageMeta.printLabel}
            </button>
            <Link href={dineInHref} className={styles.primaryBtn}>
              <Plus size={18} aria-hidden />
              {paymentSuccessPageMeta.newOrderLabel}
            </Link>
          </div>
        </div>
      </div>
    </PosFlowShell>
  );
}
