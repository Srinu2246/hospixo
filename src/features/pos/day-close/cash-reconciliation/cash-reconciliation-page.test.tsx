/// <reference types="@testing-library/jest-dom/vitest" />

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildInitialDenominationQuantities,
  cashReconciliationDenominations,
  cashReconciliationExpectedDrawerCash,
  cashReconciliationPageMeta,
  cashReconciliationSummaryMeta,
  formatCashReconciliationAmount,
  formatCashReconciliationSummaryAmount,
  getCalculatedDrawerTotal,
} from '@/features/pos/day-close/config/cash-reconciliation';

import { CashReconciliationPage } from './cash-reconciliation-page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

function getDefaultTotal() {
  const quantities = buildInitialDenominationQuantities(cashReconciliationDenominations);
  return getCalculatedDrawerTotal(cashReconciliationDenominations, quantities);
}

describe('CashReconciliationPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the page header and summary panel', () => {
    render(<CashReconciliationPage />);

    expect(
      screen.getByRole('heading', { name: cashReconciliationPageMeta.title, level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: cashReconciliationSummaryMeta.title, level: 2 }),
    ).toBeInTheDocument();
  });

  it('shows the default counted total from configured denominations', () => {
    const defaultTotal = getDefaultTotal();

    render(<CashReconciliationPage />);

    expect(defaultTotal).toBe(cashReconciliationExpectedDrawerCash);
    expect(
      screen.getByText(formatCashReconciliationSummaryAmount(defaultTotal)),
    ).toBeInTheDocument();
  });

  it('updates the summary total when a denomination quantity changes', () => {
    render(<CashReconciliationPage />);

    const firstDenomination = cashReconciliationDenominations[0];
    const quantityInput = screen.getByLabelText(
      `Quantity for ${formatCashReconciliationAmount(firstDenomination.value, { decimals: false })}`,
    );

    fireEvent.change(quantityInput, { target: { value: '0' } });

    const updatedTotal =
      getDefaultTotal() - firstDenomination.value * firstDenomination.defaultQuantity;
    expect(
      screen.getByText(formatCashReconciliationSummaryAmount(updatedTotal)),
    ).toBeInTheDocument();
  });
});
