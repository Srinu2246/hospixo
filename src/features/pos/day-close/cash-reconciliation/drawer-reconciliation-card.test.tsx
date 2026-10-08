/// <reference types="@testing-library/jest-dom/vitest" />

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildInitialDenominationQuantities,
  cashReconciliationDenominations,
  cashReconciliationDetailsMeta,
  cashReconciliationPageMeta,
  formatCashReconciliationAmount,
} from '@/features/pos/day-close/config/cash-reconciliation';

import { DrawerReconciliationCard } from './drawer-reconciliation-card';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('DrawerReconciliationCard', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('renders denomination inputs and balanced variance for default quantities', () => {
    const quantities = buildInitialDenominationQuantities(cashReconciliationDenominations);
    const onQuantitiesChange = vi.fn();

    render(
      <DrawerReconciliationCard quantities={quantities} onQuantitiesChange={onQuantitiesChange} />,
    );

    expect(
      screen.getByRole('heading', { name: cashReconciliationDetailsMeta.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Rs 0\.00 \(Balanced\)/)).toBeInTheDocument();
  });

  it('updates quantities and shows mismatch when totals change', () => {
    function Wrapper() {
      const [quantities, setQuantities] = useState(() =>
        buildInitialDenominationQuantities(cashReconciliationDenominations),
      );

      return (
        <DrawerReconciliationCard quantities={quantities} onQuantitiesChange={setQuantities} />
      );
    }

    render(<Wrapper />);

    const firstDenomination = cashReconciliationDenominations[0];
    fireEvent.change(
      screen.getByLabelText(
        `Quantity for ${formatCashReconciliationAmount(firstDenomination.value, { decimals: false })}`,
      ),
      { target: { value: '0' } },
    );

    expect(screen.queryByText(/\(Balanced\)/)).not.toBeInTheDocument();
  });

  it('navigates back to day close when the back button is clicked', () => {
    const quantities = buildInitialDenominationQuantities(cashReconciliationDenominations);

    render(<DrawerReconciliationCard quantities={quantities} onQuantitiesChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: cashReconciliationPageMeta.backLabel }));
    expect(pushMock).toHaveBeenCalledWith(cashReconciliationPageMeta.backHref);
  });
});
