import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CompactTableCard } from '@/features/pos/screens/tables/compact-table-card';
import { posTables } from '@/features/pos/config/tables';

describe('CompactTableCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the real billing status label on compact cards', () => {
    const table = posTables.find((item) => item.status === 'billing');
    if (!table) {
      throw new Error('Expected a billing table fixture');
    }

    render(<CompactTableCard table={table} selected={false} onSelect={vi.fn()} />);

    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.queryByText('Reserved')).not.toBeInTheDocument();
  });

  it('renders guest metadata and calls onSelect with the table id', () => {
    const table = posTables.find((item) => item.guests != null);
    if (!table) {
      throw new Error('Expected a table fixture with guests');
    }

    const onSelect = vi.fn();

    render(<CompactTableCard table={table} selected capacity={6} onSelect={onSelect} />);

    expect(screen.getByText(`${table.guests}/6 Guests`)).toBeInTheDocument();
    if (table.elapsedMinutes != null) {
      expect(screen.getByText(`${table.elapsedMinutes} min`)).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole('button', { name: new RegExp(table.label) }));
    expect(onSelect).toHaveBeenCalledWith(table.id);
  });
});
