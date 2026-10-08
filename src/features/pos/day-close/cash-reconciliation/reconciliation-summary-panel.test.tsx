/// <reference types="@testing-library/jest-dom/vitest" />

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  cashReconciliationPageMeta,
  cashReconciliationSummaryMeta,
  formatCashReconciliationSummaryAmount,
} from '@/features/pos/day-close/config/cash-reconciliation';

import { ReconciliationSummaryPanel } from './reconciliation-summary-panel';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('ReconciliationSummaryPanel', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('renders counted total and balanced difference', () => {
    render(<ReconciliationSummaryPanel totalCounted={15450} variance={0} />);

    expect(
      screen.getByRole('heading', { name: cashReconciliationSummaryMeta.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(formatCashReconciliationSummaryAmount(15450))).toBeInTheDocument();
    expect(screen.getByText(formatCashReconciliationSummaryAmount(0))).toBeInTheDocument();
  });

  it('accepts reconciliation notes', () => {
    render(<ReconciliationSummaryPanel totalCounted={15000} variance={-450} />);

    const notesInput = screen.getByPlaceholderText(cashReconciliationSummaryMeta.notesPlaceholder);
    fireEvent.change(notesInput, { target: { value: 'Short by one 500 note' } });
    expect(notesInput).toHaveValue('Short by one 500 note');
  });

  it('navigates to daily sales summary on submit', () => {
    render(<ReconciliationSummaryPanel totalCounted={15450} variance={0} />);

    fireEvent.click(screen.getByRole('button', { name: cashReconciliationPageMeta.submitLabel }));
    expect(pushMock).toHaveBeenCalledWith(cashReconciliationPageMeta.submitHref);
  });
});
