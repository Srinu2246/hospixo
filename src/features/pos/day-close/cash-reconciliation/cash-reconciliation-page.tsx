'use client';

import { useMemo, useState } from 'react';

import {
  buildInitialDenominationQuantities,
  cashReconciliationDenominations,
  cashReconciliationExpectedDrawerCash,
  getCalculatedDrawerTotal,
  getReconciliationVariance,
} from '@/features/pos/day-close/config/cash-reconciliation';

import { CashReconciliationHeader } from './cash-reconciliation-header';
import { DrawerReconciliationCard } from './drawer-reconciliation-card';
import { ReconciliationSummaryPanel } from './reconciliation-summary-panel';

import styles from './cash-reconciliation-page.module.css';

export function CashReconciliationPage() {
  const [quantities, setQuantities] = useState(() =>
    buildInitialDenominationQuantities(cashReconciliationDenominations),
  );

  const calculatedTotal = useMemo(
    () => getCalculatedDrawerTotal(cashReconciliationDenominations, quantities),
    [quantities],
  );
  const variance = useMemo(
    () => getReconciliationVariance(cashReconciliationExpectedDrawerCash, calculatedTotal),
    [calculatedTotal],
  );

  return (
    <div className={styles.page}>
      <CashReconciliationHeader />

      <div className={styles.layout}>
        <DrawerReconciliationCard quantities={quantities} onQuantitiesChange={setQuantities} />
        <ReconciliationSummaryPanel totalCounted={calculatedTotal} variance={variance} />
      </div>
    </div>
  );
}
