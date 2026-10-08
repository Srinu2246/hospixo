import { routes } from '@/config/routes';

export const cashReconciliationPageMeta = {
  title: 'Cash Reconciliation',
  subtitle: 'Count drawer cash and verify against expected system balance',
  backLabel: 'Back',
  submitLabel: 'Submit & Verify',
  backHref: routes.platform.pos.dayClose,
  submitHref: routes.platform.pos.dailySalesSummary,
};

export const cashReconciliationDetailsMeta = {
  title: 'Cash Reconciliation',
  caption: 'Enter physical denomination quantities',
  expectedLabel: 'Expected Drawer Cash:',
  calculatedTotalLabel: 'Calculated Total:',
  varianceLabel: 'Discrepancy / Variance:',
  balancedLabel: 'Balanced',
};

export const cashReconciliationSummaryMeta = {
  title: 'Summary',
  totalCountedLabel: 'Total Counted',
  differenceLabel: 'Difference',
  notesLabel: 'Reconciliation Notes',
  notesPlaceholder: 'Add any discrepancies notes here...',
};

export interface CashDenomination {
  id: string;
  value: number;
  defaultQuantity: number;
}

export const cashReconciliationDenominations: CashDenomination[] = [
  { id: 'd2000', value: 2000, defaultQuantity: 2 },
  { id: 'd500', value: 500, defaultQuantity: 18 },
  { id: 'd200', value: 200, defaultQuantity: 5 },
  { id: 'd100', value: 100, defaultQuantity: 12 },
  { id: 'd50', value: 50, defaultQuantity: 4 },
  { id: 'd10', value: 10, defaultQuantity: 5 },
];

export const cashReconciliationExpectedDrawerCash = 15450;

export function formatCashReconciliationAmount(amount: number, options?: { decimals?: boolean }) {
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: options?.decimals === false ? 0 : 2,
    maximumFractionDigits: options?.decimals === false ? 0 : 2,
  });
  return `Rs ${formatted}`;
}

export function formatCashReconciliationSummaryAmount(amount: number) {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getDenominationSubtotal(value: number, quantity: number) {
  return value * quantity;
}

export function getCalculatedDrawerTotal(
  denominations: CashDenomination[],
  quantities: Record<string, number>,
) {
  return denominations.reduce(
    (sum, denomination) =>
      sum + getDenominationSubtotal(denomination.value, quantities[denomination.id] ?? 0),
    0,
  );
}

export function getReconciliationVariance(expected: number, calculated: number) {
  return calculated - expected;
}

export function isReconciliationBalanced(variance: number) {
  return variance === 0;
}

export function buildInitialDenominationQuantities(denominations: CashDenomination[]) {
  return denominations.reduce<Record<string, number>>((acc, denomination) => {
    acc[denomination.id] = denomination.defaultQuantity;
    return acc;
  }, {});
}
