import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OrderReviewPanel } from '@/features/pos/screens/checkout-payment/order-review-panel';
import { checkoutPageMeta } from '@/features/pos/config/checkout';
import { PosOrderProvider } from '@/context/pos-order';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, ...props }: { alt?: string }) => <img alt={alt ?? ''} {...props} />,
}));

describe('OrderReviewPanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders live order lines and totals from POS order context', () => {
    render(
      <PosOrderProvider>
        <OrderReviewPanel />
      </PosOrderProvider>,
    );

    expect(screen.getByRole('heading', { name: checkoutPageMeta.title })).toBeInTheDocument();
    expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument();
    expect(screen.getByText('Table 01')).toBeInTheDocument();
    expect(screen.getByText(/Order: #0039/)).toBeInTheDocument();
    expect(screen.getByText(checkoutPageMeta.summaryTitle)).toBeInTheDocument();
  });
});
