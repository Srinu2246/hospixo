import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PosOrderProvider } from '@/context/pos-order';
import { buildCheckoutFeeLines, computeCheckoutTotal } from '@/features/pos/config/checkout';
import {
  formatCheckoutLineDetail,
  useCheckoutPage,
} from '@/features/pos/screens/checkout-payment/use-checkout-page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/checkout-payment',
}));

function CheckoutProbe() {
  const page = useCheckoutPage();
  return (
    <div>
      <span data-testid="subtotal">{page.subtotal}</span>
      <span data-testid="total">{page.total}</span>
      <span data-testid="fee-line-count">{page.feeLines.length}</span>
      <span data-testid="first-detail">{page.lines[0]?.detail ?? ''}</span>
      <span data-testid="method">{page.selectedMethod}</span>
      <button type="button" onClick={() => page.setSelectedMethod('card')}>
        Card
      </button>
      <button type="button" onClick={() => page.handleConfirm()}>
        Confirm
      </button>
    </div>
  );
}

describe('formatCheckoutLineDetail', () => {
  it('joins variant, add-ons, and cooking preference', () => {
    expect(
      formatCheckoutLineDetail({
        id: '1',
        menuItemId: 'pasta',
        name: 'Pasta',
        quantity: 1,
        price: 100,
        variant: 'Large',
        addOns: ['Extra Cheese'],
        cookingPreference: 'Medium',
        imageUrl: '/pasta.png',
      }),
    ).toBe('Large, Extra Cheese, Medium');
  });

  it('handles missing add-ons and cooking preference', () => {
    expect(
      formatCheckoutLineDetail({
        id: '2',
        menuItemId: 'rice',
        name: 'Rice',
        quantity: 1,
        price: 50,
        variant: 'Regular',
        imageUrl: '/rice.png',
      }),
    ).toBe('Regular');
  });
});

describe('useCheckoutPage', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('uses shared checkout fee lines so compact and desktop totals match', () => {
    render(
      <PosOrderProvider>
        <CheckoutProbe />
      </PosOrderProvider>,
    );

    const subtotal = Number(screen.getByTestId('subtotal').textContent);
    const total = Number(screen.getByTestId('total').textContent);
    const expectedTotal = computeCheckoutTotal(buildCheckoutFeeLines(subtotal));

    expect(subtotal).toBeGreaterThan(0);
    expect(Number(screen.getByTestId('fee-line-count').textContent)).toBeGreaterThan(3);
    expect(total).toBe(expectedTotal);
    expect(screen.getByTestId('first-detail').textContent).toContain('Large');
    expect(screen.getByTestId('first-detail').textContent).toContain('Extra Cheese');
  });

  it('navigates to payment success on confirm', () => {
    render(
      <PosOrderProvider>
        <CheckoutProbe />
      </PosOrderProvider>,
    );

    screen.getByRole('button', { name: 'Confirm' }).click();
    expect(pushMock).toHaveBeenCalledWith('/payment-success');
  });

  it('can change the selected payment method', () => {
    render(
      <PosOrderProvider>
        <CheckoutProbe />
      </PosOrderProvider>,
    );

    expect(screen.getByTestId('method').textContent).toBe('cash');
    fireEvent.click(screen.getByRole('button', { name: 'Card' }));
    expect(screen.getByTestId('method').textContent).toBe('card');
  });
});
