'use client';

import { useRouter } from 'next/navigation';

import {
  cashReconciliationDenominations,
  cashReconciliationDetailsMeta,
  cashReconciliationExpectedDrawerCash,
  cashReconciliationPageMeta,
  formatCashReconciliationAmount,
  getDenominationSubtotal,
  getReconciliationVariance,
  isReconciliationBalanced,
} from '@/features/pos/day-close/config/cash-reconciliation';

import styles from './drawer-reconciliation-card.module.css';

interface DrawerReconciliationCardProps {
  quantities: Record<string, number>;
  onQuantitiesChange: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function DrawerReconciliationCard({
  quantities,
  onQuantitiesChange,
}: Readonly<DrawerReconciliationCardProps>) {
  const router = useRouter();

  const calculatedTotal = cashReconciliationDenominations.reduce(
    (sum, denomination) =>
      sum + getDenominationSubtotal(denomination.value, quantities[denomination.id] ?? 0),
    0,
  );

  const variance = getReconciliationVariance(cashReconciliationExpectedDrawerCash, calculatedTotal);

  const balanced = isReconciliationBalanced(variance);

  function handleQuantityChange(id: string, rawValue: string) {
    const parsed = Number.parseInt(rawValue, 10);

    onQuantitiesChange((prev) => ({
      ...prev,
      [id]: Number.isNaN(parsed) || parsed < 0 ? 0 : parsed,
    }));
  }

  return (
    <div className={styles.column}>
      <section className={styles.card} aria-labelledby="drawer-reconciliation-heading">
        <div className={styles.cardHeader}>
          <h2 id="drawer-reconciliation-heading" className={styles.cardTitle}>
            {cashReconciliationDetailsMeta.title}
          </h2>

          <p className={styles.cardCaption}>{cashReconciliationDetailsMeta.caption}</p>
        </div>

        <div className={styles.expectedBar}>
          <span>{cashReconciliationDetailsMeta.expectedLabel}</span>

          <strong>{formatCashReconciliationAmount(cashReconciliationExpectedDrawerCash)}</strong>
        </div>

        <ul className={styles.denominationList}>
          {cashReconciliationDenominations.map((denomination) => {
            const quantity = quantities[denomination.id] ?? 0;
            const subtotal = getDenominationSubtotal(denomination.value, quantity);

            return (
              <li key={denomination.id} className={styles.denominationRow}>
                <span className={styles.denominationLabel}>
                  {formatCashReconciliationAmount(denomination.value, {
                    decimals: false,
                  })}
                </span>

                <span className={styles.multiply} aria-hidden>
                  ×
                </span>

                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className={styles.quantityInput}
                  value={quantity}
                  onChange={(event) => handleQuantityChange(denomination.id, event.target.value)}
                  aria-label={`Quantity for ${formatCashReconciliationAmount(denomination.value, {
                    decimals: false,
                  })}`}
                />

                <span className={styles.subtotal}>
                  {formatCashReconciliationAmount(subtotal, {
                    decimals: false,
                  })}
                </span>
              </li>
            );
          })}
        </ul>

        <div className={styles.calculatedTotalRow}>
          <span>{cashReconciliationDetailsMeta.calculatedTotalLabel}</span>

          <strong>{formatCashReconciliationAmount(calculatedTotal)}</strong>
        </div>

        <div
          className={`${styles.varianceBar} ${
            balanced ? styles.varianceBalanced : styles.varianceMismatch
          }`}
        >
          <span>{cashReconciliationDetailsMeta.varianceLabel}</span>

          <strong>
            {formatCashReconciliationAmount(Math.abs(variance))}
            {balanced ? ` (${cashReconciliationDetailsMeta.balancedLabel})` : ''}
          </strong>
        </div>
      </section>

      <button
        type="button"
        className={styles.backBtn}
        onClick={() => router.push(cashReconciliationPageMeta.backHref)}
      >
        {cashReconciliationPageMeta.backLabel}
      </button>
    </div>
  );
}
