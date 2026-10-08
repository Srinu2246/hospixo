import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { openOrders } from '@/features/pos/config/open-orders';
import { OpenOrdersTable } from '@/features/pos/screens/open-orders/open-orders-table';

describe('OpenOrdersTable', () => {
  it('renders status pills and action buttons', () => {
    render(
      <OpenOrdersTable orders={[openOrders[0]!]} onAddItems={vi.fn()} onSettleBill={vi.fn()} />,
    );

    expect(screen.getByText('KOT Sent')).toBeTruthy();
    expect(screen.getByText('Unpaid')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add Items' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Settle' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Time' })).toBeTruthy();
  });
});
