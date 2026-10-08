import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/config/routes';

import { PaymentMethodPanel } from '@/features/pos/screens/checkout-payment/payment-method-panel';
import { checkoutPageMeta } from '@/features/pos/config/checkout';
import { PosOrderProvider, usePosOrder } from '@/context/pos-order';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/checkout-payment',
}));

function OrderSnapshot() {
  const { orderLines, orderNumber } = usePosOrder();
  return (
    <div>
      <p data-testid="line-count">{orderLines.length}</p>
      <p data-testid="order-number">{orderNumber}</p>
    </div>
  );
}

describe('PaymentMethodPanel', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('navigates to payment success and clears the cart on confirm', () => {
    render(
      <PosOrderProvider>
        <OrderSnapshot />
        <PaymentMethodPanel selectedMethod="cash" onSelectMethod={() => undefined} />
      </PosOrderProvider>,
    );

    expect(screen.getByTestId('line-count')).not.toHaveTextContent('0');

    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(checkoutPageMeta.confirmLabel) }),
    );

    expect(pushMock).toHaveBeenCalledWith(routes.platform.pos.paymentSuccess);
    expect(screen.getByTestId('line-count')).toHaveTextContent('0');
    expect(screen.getByTestId('order-number')).toHaveTextContent('#0040');
  });

  it('renders payment methods and the live total', () => {
    render(
      <PosOrderProvider>
        <PaymentMethodPanel selectedMethod="upi" onSelectMethod={() => undefined} />
      </PosOrderProvider>,
    );

    expect(
      screen.getByRole('heading', { name: checkoutPageMeta.paymentTitle }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'UPI' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Grand Total/i)).toBeInTheDocument();
  });

  it('supports notify toggle, phone edits, and payment method changes', () => {
    const onSelectMethod = vi.fn();

    render(
      <PosOrderProvider>
        <PaymentMethodPanel selectedMethod="cash" onSelectMethod={onSelectMethod} />
      </PosOrderProvider>,
    );

    const notifyToggle = screen.getByRole('switch');
    expect(notifyToggle).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(notifyToggle);
    expect(notifyToggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '+91 90000 00000' },
    });
    expect(screen.getByRole('textbox')).toHaveValue('+91 90000 00000');

    fireEvent.click(screen.getByRole('button', { name: 'Card' }));
    expect(onSelectMethod).toHaveBeenCalledWith('card');
    expect(screen.getByRole('button', { name: checkoutPageMeta.smsLabel })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: checkoutPageMeta.whatsappLabel }),
    ).toBeInTheDocument();
  });
});
