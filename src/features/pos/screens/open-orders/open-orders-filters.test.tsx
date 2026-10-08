import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OpenOrdersFilters } from '@/features/pos/screens/open-orders/open-orders-filters';

describe('OpenOrdersFilters', () => {
  afterEach(() => {
    cleanup();
  });

  it('marks the active filter and notifies on change', () => {
    const onChange = vi.fn();

    render(<OpenOrdersFilters activeType="dineIn" onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'Dine-in' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Online' }));
    expect(onChange).toHaveBeenCalledWith('online');
  });
});
