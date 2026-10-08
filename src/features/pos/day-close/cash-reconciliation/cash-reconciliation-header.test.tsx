import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CashReconciliationHeader } from '@/features/pos/day-close/cash-reconciliation/cash-reconciliation-header';
import { cashReconciliationPageMeta } from '@/features/pos/day-close/config/cash-reconciliation';

describe('CashReconciliationHeader', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders title and subtitle from config', () => {
    render(<CashReconciliationHeader />);

    expect(
      screen.getByRole('heading', { name: cashReconciliationPageMeta.title, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(cashReconciliationPageMeta.subtitle)).toBeInTheDocument();
  });
});
