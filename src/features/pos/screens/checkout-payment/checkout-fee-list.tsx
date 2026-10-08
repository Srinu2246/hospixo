'use client';

import { formatCheckoutRupee, type CheckoutFeeLine } from '@/features/pos/config/checkout';

import styles from './checkout-fee-list.module.css';

interface CheckoutFeeListProps {
  feeLines: CheckoutFeeLine[];
  total: number;
  grandTotalLabel?: string;
  variant?: 'bar' | 'inline';
  bordered?: boolean;
  dividerStyle?: 'solid' | 'dashed';
}

export function CheckoutFeeList({
  feeLines,
  total,
  grandTotalLabel = 'Grand Total',
  variant = 'bar',
  bordered = false,
  dividerStyle = 'solid',
}: Readonly<CheckoutFeeListProps>) {
  const borderClass =
    dividerStyle === 'dashed' ? styles.feeListBorderedDashed : styles.feeListBordered;

  return (
    <>
      <dl className={`${styles.feeList} ${bordered ? borderClass : ''}`}>
        {feeLines.map((fee) => (
          <div key={fee.id} className={styles.feeRow}>
            <dt className={styles.feeLabel}>
              {fee.label}
              {fee.tag ? <span className={styles.feeTag}>{fee.tag}</span> : null}
            </dt>
            <dd className={`${styles.feeAmount} ${fee.tone === 'discount' ? styles.discount : ''}`}>
              {formatCheckoutRupee(fee.amount, {
                signedDiscount: fee.tone === 'discount',
              })}
            </dd>
          </div>
        ))}
      </dl>

      <div className={`${styles.totalBar} ${variant === 'inline' ? styles.totalBarInline : ''}`}>
        <span className={styles.totalLabel}>{grandTotalLabel}</span>
        <span className={styles.totalValue}>{formatCheckoutRupee(total)}</span>
      </div>
    </>
  );
}
