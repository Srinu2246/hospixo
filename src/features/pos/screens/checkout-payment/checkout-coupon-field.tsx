'use client';

import { checkoutPageMeta } from '@/features/pos/config/checkout';

import styles from './checkout-coupon-field.module.css';

interface CheckoutCouponFieldProps {
  showLabel?: boolean;
  className?: string;
}

export function CheckoutCouponField({
  showLabel = true,
  className,
}: Readonly<CheckoutCouponFieldProps>) {
  return (
    <label className={`${styles.field} ${className ?? ''}`}>
      {showLabel ? (
        <span className={styles.label}>{checkoutPageMeta.discountCodeLabel}</span>
      ) : null}
      <div className={styles.inputWrap}>
        <input
          type="text"
          className={styles.input}
          placeholder={checkoutPageMeta.couponPlaceholder}
        />
        <button type="button" className={styles.applyBtn}>
          {checkoutPageMeta.applyLabel}
        </button>
      </div>
    </label>
  );
}
