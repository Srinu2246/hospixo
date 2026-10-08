'use client';

import Link from 'next/link';
import { CheckCircle2, Plus, Printer } from 'lucide-react';

import { formatPaymentRupee } from '@/features/pos/config/payment-success';
import {
  PosCompactBody,
  PosCompactHeader,
  PosCompactPage,
} from '@/features/pos/screens/layout/pos-compact-page';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';

import type { PaymentSuccessPageViewModel } from './use-payment-success-page';
import styles from './compact-payment-success-content.module.css';

interface CompactPaymentSuccessContentProps extends PaymentSuccessPageViewModel {
  layout: 'mobile' | 'tablet';
}

export function CompactPaymentSuccessContent({
  layout,
  lines,
  totals,
  meta,
  pageMeta,
  itemCount,
  dineInHref,
}: Readonly<CompactPaymentSuccessContentProps>) {
  const headline = `${meta.orderNumber} · ${meta.tableLabel.replace('Table: ', 'Table ')} · ${itemCount} items`;

  return (
    <PosMobileShell activeNavId="orders" withPageBg>
      <PosCompactPage>
        <PosCompactHeader>
          <PosMobileHeader title={pageMeta.headerTitle} subtitle={headline} />
        </PosCompactHeader>
        <PosCompactBody
          className={`${styles.body} ${layout === 'tablet' ? styles.tabletPage : ''}`}
        >
          <section className={styles.hero} aria-labelledby="payment-success-heading">
            <div className={styles.successIconWrap}>
              <CheckCircle2 className={styles.successIcon} size={32} aria-hidden />
            </div>
            <h1 id="payment-success-heading" className={styles.title}>
              {pageMeta.title}
            </h1>
            <p className={styles.subtitle}>{headline}</p>
          </section>

          <article className={styles.receipt}>
            <h2 className={styles.receiptBrand}>{pageMeta.receiptBrand}</h2>
            <p className={styles.receiptMeta}>
              {meta.dateTime} · {meta.cashierLabel.replace('Cashier: ', '')}
            </p>

            <ul className={styles.lines}>
              {lines.map((line) => (
                <li key={line.id} className={styles.line}>
                  <span>
                    {line.name} x{line.quantity}
                  </span>
                  <strong>{formatPaymentRupee(line.amount)}</strong>
                </li>
              ))}
            </ul>

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Sub Total</span>
                <span>{formatPaymentRupee(totals.subtotal)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Tax (5%)</span>
                <span>{formatPaymentRupee(totals.tax)}</span>
              </div>
            </div>

            <div className={styles.grandTotal}>
              <span>Grand Total</span>
              <strong className={styles.grandTotalValue}>{formatPaymentRupee(totals.total)}</strong>
            </div>

            <p className={styles.thankYou}>{pageMeta.thankYouMessage}</p>
          </article>

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn}>
              <Printer size={18} aria-hidden />
              {pageMeta.printLabel}
            </button>
            <Link href={dineInHref} className={styles.primaryBtn}>
              <Plus size={18} aria-hidden />
              {pageMeta.newOrderLabel}
            </Link>
          </div>
        </PosCompactBody>
      </PosCompactPage>
    </PosMobileShell>
  );
}
