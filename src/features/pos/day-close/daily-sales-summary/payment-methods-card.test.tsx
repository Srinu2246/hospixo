import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { PaymentMethodsCard } from '@/features/pos/day-close/daily-sales-summary/payment-methods-card';
import {
  dailySalesPaymentMethods,
  dailySalesPaymentMethodsMeta,
} from '@/features/pos/day-close/config/daily-sales-summary';

describe('PaymentMethodsCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders payment method breakdown from config', () => {
    render(<PaymentMethodsCard />);

    expect(
      screen.getByRole('heading', { name: dailySalesPaymentMethodsMeta.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(dailySalesPaymentMethodsMeta.periodLabel)).toBeInTheDocument();

    for (const method of dailySalesPaymentMethods) {
      expect(screen.getAllByText(method.label).length).toBeGreaterThan(0);
      expect(screen.getByText(`${method.percent}%`)).toBeInTheDocument();
    }
  });
});
