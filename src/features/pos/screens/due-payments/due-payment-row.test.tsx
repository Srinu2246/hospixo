import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DuePaymentRow } from '@/features/pos/screens/due-payments/due-payment-row';
import { duePaymentsFixture as duePayments } from '@/features/pos/config/due-payments.fixture';

describe('DuePaymentRow', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders payment details and settles unpaid rows', () => {
    const onSettle = vi.fn();
    const payment = duePayments[0];

    render(<DuePaymentRow payment={payment} onSettle={onSettle} />);

    expect(screen.getByRole('heading', { name: payment.guestName })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Settle' }));
    expect(onSettle).toHaveBeenCalledWith(payment.id);
  });

  it('disables settle for paid payments', () => {
    render(<DuePaymentRow payment={duePayments[2]} onSettle={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Settled' })).toBeDisabled();
  });
});
