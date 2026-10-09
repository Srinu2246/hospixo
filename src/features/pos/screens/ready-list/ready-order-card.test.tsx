import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ReadyOrderCard } from '@/features/pos/screens/ready-list/ready-order-card';
import { readyOrders } from '@/features/pos/config/ready-list';

describe('ReadyOrderCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders order details and serves on action', () => {
    const onServe = vi.fn();
    const order = readyOrders[0];

    render(<ReadyOrderCard order={order} onServe={onServe} isMutating={false} />);

    expect(screen.getByRole('heading', { name: order.table })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Serve' }));
    expect(onServe).toHaveBeenCalledWith(order.id);
  });
});
